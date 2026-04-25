import AVFoundation
import Foundation

struct Arguments {
  let outputPath: String
  let rate: Float
  let text: String
  let voiceLanguage: String
  let voiceName: String
}

enum ArgumentError: Error {
  case invalid(String)
}

func parseArguments() throws -> Arguments {
  var values: [String: String] = [:]
  var index = 1
  let args = CommandLine.arguments

  while index < args.count {
    let key = args[index]
    guard key.hasPrefix("--"), index + 1 < args.count else {
      throw ArgumentError.invalid("Expected flag/value pairs.")
    }

    values[key] = args[index + 1]
    index += 2
  }

  guard let outputPath = values["--output"], !outputPath.isEmpty else {
    throw ArgumentError.invalid("Missing --output.")
  }

  guard let text = values["--text"], !text.isEmpty else {
    throw ArgumentError.invalid("Missing --text.")
  }

  let rate = Float(values["--rate"] ?? "") ?? 0.41
  let voiceLanguage = values["--voice-language"] ?? "en-GB"
  let voiceName = values["--voice-name"] ?? "Flo"

  return Arguments(outputPath: outputPath, rate: rate, text: text, voiceLanguage: voiceLanguage, voiceName: voiceName)
}

func pickVoice(name: String, language: String) -> AVSpeechSynthesisVoice? {
  let voices = AVSpeechSynthesisVoice.speechVoices()

  if let exactName = voices.first(where: { $0.name.caseInsensitiveCompare(name) == .orderedSame }) {
    return exactName
  }

  if let matchingName = voices.first(where: { $0.name.localizedCaseInsensitiveContains(name) && $0.language.hasPrefix(language.prefix(2)) }) {
    return matchingName
  }

  if let matchingLanguage = voices.first(where: { $0.language == language || $0.language.hasPrefix(language.prefix(2)) }) {
    return matchingLanguage
  }

  return AVSpeechSynthesisVoice(language: language)
}

func renderAudio(arguments: Arguments) throws {
  let outputURL = URL(fileURLWithPath: arguments.outputPath)
  let synthesizer = AVSpeechSynthesizer()
  let utterance = AVSpeechUtterance(string: arguments.text)

  utterance.voice = pickVoice(name: arguments.voiceName, language: arguments.voiceLanguage)
  utterance.rate = arguments.rate
  utterance.pitchMultiplier = 1.0
  utterance.volume = 1.0
  utterance.preUtteranceDelay = 0
  utterance.postUtteranceDelay = 0

  try? FileManager.default.removeItem(at: outputURL)

  var audioFile: AVAudioFile?
  var writeError: Error?
  var didWriteFrames = false
  var isFinished = false

  synthesizer.write(utterance) { buffer in
    guard let pcmBuffer = buffer as? AVAudioPCMBuffer else {
      isFinished = true
      return
    }

    if pcmBuffer.frameLength == 0 {
      isFinished = true
      return
    }

    do {
      if audioFile == nil {
        audioFile = try AVAudioFile(
          forWriting: outputURL,
          settings: pcmBuffer.format.settings,
          commonFormat: pcmBuffer.format.commonFormat,
          interleaved: pcmBuffer.format.isInterleaved
        )
      }

      try audioFile?.write(from: pcmBuffer)
      didWriteFrames = true
    } catch {
      writeError = error
      isFinished = true
    }
  }

  let deadline = Date().addingTimeInterval(45)
  while !isFinished && Date() < deadline {
    RunLoop.current.run(mode: .default, before: Date().addingTimeInterval(0.05))
  }

  if !isFinished {
    throw ArgumentError.invalid("Speech rendering timed out.")
  }

  if let writeError {
    throw writeError
  }

  guard didWriteFrames else {
    throw ArgumentError.invalid("Speech renderer produced no audio frames.")
  }
}

do {
  try renderAudio(arguments: parseArguments())
} catch {
  fputs("render-demo-preview-audio.swift failed: \(error)\n", stderr)
  exit(1)
}
