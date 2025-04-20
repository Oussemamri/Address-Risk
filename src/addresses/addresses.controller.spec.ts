import { Test, TestingModule } from '@nestjs/testing';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';

describe('AddressesController', () => {
  let controller: AddressesController;
  let service: AddressesService;

  beforeEach(async () => {
    // Create a mock for AddressesService
    const mockAddressesService = {
      create: jest.fn(),
      getRisks: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressesController],
      providers: [
        {
          provide: AddressesService,
          useValue: mockAddressesService,
        },
      ],
    }).compile();

    controller = module.get<AddressesController>(AddressesController);
    service = module.get<AddressesService>(AddressesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
