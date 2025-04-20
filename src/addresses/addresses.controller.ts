import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';

@Controller('api/addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  create(@Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(createAddressDto);
  }

  @Get(':id/risks')
  getRisks(@Param('id', ParseIntPipe) id: number) {
    return this.addressesService.getRisks(id);
  }
}
