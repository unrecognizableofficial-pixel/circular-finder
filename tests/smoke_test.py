import os
from pathlib import Path
import sys

from fastapi.testclient import TestClient


TEST_DB = Path("test_circular_finder.db")
if TEST_DB.exists():
    TEST_DB.unlink()

os.environ["DATABASE_URL"] = "sqlite:///./test_circular_finder.db"
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app  # noqa: E402


def assert_ok(response, expected=200):
    assert response.status_code == expected, response.text


def main():
    with TestClient(app) as client:
        bootstrap = client.get("/api/bootstrap")
        assert_ok(bootstrap)
        bootstrap_payload = bootstrap.json()
        assert bootstrap_payload["brands"], "Expected seeded brands"
        assert bootstrap_payload["suppliers"], "Expected seeded suppliers"
        assert bootstrap_payload["marketplace"], "Expected seeded listings"

        login = client.post("/api/auth/login", json={"email": "mia@circularfinder.com", "password": "Circular123!"})
        assert_ok(login)
        token = login.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        scan = client.post(
            "/api/scan/lookup",
            json={"scan_type": "qr", "scan_value": "QR-EL-TRN-001", "hints": "sage trench"},
            headers=headers,
        )
        assert_ok(scan)
        passport = scan.json()["passport"]
        assert passport["passportId"] == "DPP-EL-TRN-001"

        upload = client.post(
            "/api/scan/upload",
            files={"file": ("camera-capture.jpg", b"fake image payload", "image/jpeg")},
            data={"hints": "indigo denim jeans", "brand_hint": "Loop Standard"},
            headers=headers,
        )
        assert_ok(upload)
        assert upload.json()["recognized"] is True

        wardrobe_add = client.post(
            "/api/wardrobe/items",
            json={"passport_id": "DPP-AU-SHR-014", "nickname": "Travel overshirt", "condition": "excellent"},
            headers=headers,
        )
        assert_ok(wardrobe_add)

        wardrobe = client.get("/api/wardrobe", headers=headers)
        assert_ok(wardrobe)
        wardrobe_items = wardrobe.json()["items"]
        assert len(wardrobe_items) >= 4
        denim_item = next(item for item in wardrobe_items if item["passport"]["passportId"] == "DPP-LS-DNM-077")

        listing = client.post(
            "/api/marketplace/listings",
            json={
                "passport_id": "DPP-LS-DNM-077",
                "wardrobe_item_id": denim_item["id"],
                "title": "Second Mile Denim, verified passport included",
                "description": "Ready for a second owner.",
                "size_label": "30",
                "condition": "good",
                "price": 132,
            },
            headers=headers,
        )
        assert_ok(listing)

        marketplace = client.get("/api/marketplace/listings?brand=Loop%20Standard")
        assert_ok(marketplace)
        assert marketplace.json()["items"], "Expected marketplace listings for Loop Standard"

        verification = client.post(
            "/api/verification/passports",
            json={
                "request_type": "product_passport",
                "product_name": "Juniper Modular Coat",
                "brand_name": "Juniper Trace",
                "target_demographic": "Women",
                "materials": ["Organic Cotton", "Recycled Nylon"],
                "country_of_origin": "Portugal",
                "notes": "Created from a camera scan that could not be matched.",
            },
            headers=headers,
        )
        assert_ok(verification)

        admin_login = client.post("/api/auth/login", json={"email": "admin@circularfinder.com", "password": "Circular123!"})
        assert_ok(admin_login)
        admin_headers = {"Authorization": f"Bearer {admin_login.json()['token']}"}

        queue = client.get("/api/admin/verification-requests", headers=admin_headers)
        assert_ok(queue)
        request_id = queue.json()["items"][0]["id"]

        review = client.post(
            f"/api/admin/verification-requests/{request_id}/review",
            json={"status": "approved", "review_notes": "Supplier evidence confirmed."},
            headers=admin_headers,
        )
        assert_ok(review)

        print("smoke test passed")


if __name__ == "__main__":
    main()
