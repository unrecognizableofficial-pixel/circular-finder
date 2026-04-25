import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SearchSuppliersDto } from "@/modules/suppliers/dto/search-suppliers.dto";
import { SuppliersService } from "@/modules/suppliers/suppliers.service";

@ApiTags("suppliers")
@Controller("suppliers")
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get("map")
  map(@Query() query: SearchSuppliersDto) {
    return this.suppliersService.map(query);
  }
}
