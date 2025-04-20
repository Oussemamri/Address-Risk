import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddressesService } from './addresses.service';
import { Address } from './entities/address.entity';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AddressesService', () => {
  let service: AddressesService;
  let repo: Repository<Address>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        {
          provide: getRepositoryToken(Address),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AddressesService>(AddressesService);
    repo = module.get<Repository<Address>>(getRepositoryToken(Address));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an address when API returns results', async () => {
      // Mock the axios response
      const mockApiResponse = {
        data: {
          features: [
            {
              properties: {
                label: '8 bd du Port, 56170 Sarzeau',
                housenumber: '8',
                street: 'bd du Port',
                postcode: '56170',
                citycode: '56242',
              },
              geometry: {
                coordinates: [-2.73745, 47.58234], // [longitude, latitude]
              },
            },
          ],
        },
      };
      
      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);
      
      // Mock the repository save method
      const saveSpy = jest.spyOn(repo, 'save').mockImplementation((address) => 
        Promise.resolve({ ...address, id: 1 } as Address));
      
      // Call the service
      const result = await service.create({ q: '8 bd du Port' });
      
      // Check the results
      expect(result).toEqual(expect.objectContaining({
        id: 1,
        label: '8 bd du Port, 56170 Sarzeau',
        housenumber: '8',
        street: 'bd du Port',
        postcode: '56170',
        citycode: '56242',
        latitude: 47.58234,
        longitude: -2.73745,
      }));
      
      // Verify API was called with correct params
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api-adresse.data.gouv.fr/search/',
        expect.objectContaining({
          params: { q: '8 bd du Port', limit: 1 },
        }),
      );
    });

    it('should throw NotFoundException when API returns no results', async () => {
      // Mock the axios response with no features
      mockedAxios.get.mockResolvedValueOnce({ data: { features: [] } });
      
      // Expect the service to throw NotFoundException
      await expect(service.create({ q: 'nonexistent address' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getRisks', () => {
    it('should return risk data for a valid address', async () => {
      // Mock an address in the database
      const mockAddress = {
        id: 1,
        label: '8 bd du Port, 56170 Sarzeau',
        housenumber: '8',
        street: 'bd du Port',
        postcode: '56170',
        citycode: '56242',
        latitude: 47.58234,
        longitude: -2.73745,
      };
      
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(mockAddress as Address);
      
      // Mock a successful API response
      const mockApiResponse = {
        data: {
          code: "OK",
          data: {
            commune: {
              code_insee: "56242",
              nom: "Sarzeau",
              risques: [
                {
                  type: "Inondation",
                  niveau: "Moyen",
                  description: "Zone potentiellement inondable"
                }
              ]
            }
          }
        }
      };
      
      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);
      
      // Call the service
      const result = await service.getRisks(1);
      
      // Check the results
      expect(result).toEqual(mockApiResponse.data);
      
      // Verify API was called with correct params
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://www.georisques.gouv.fr/api/v3/v1/resultats_rapport_risque',
        expect.objectContaining({
          params: { latlon: '-2.73745,47.58234' }
        }),
      );
    });
  
    it('should return mock data when API call fails', async () => {
      // Mock an address in the database
      const mockAddress = {
        id: 1,
        label: '8 bd du Port, 56170 Sarzeau',
        housenumber: '8',
        street: 'bd du Port',
        postcode: '56170',
        citycode: '56242',
        latitude: 47.58234,
        longitude: -2.73745,
      };
      
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(mockAddress as Address);
      
      // Mock a failed API response
      mockedAxios.get.mockRejectedValueOnce(new Error('API error'));
      
      // Call the service
      const result = await service.getRisks(1);
      
      // Check the results - should be the mock response
      expect(result).toHaveProperty('code', 'OK');
      expect(result).toHaveProperty('data.commune.code_insee', '56242');
      expect(result.data.commune.risques).toBeDefined();
      expect(result.data.commune.risques.length).toBeGreaterThan(0);
    });
  
    it('should throw NotFoundException when address does not exist', async () => {
      // Mock address not found
      jest.spyOn(repo, 'findOne').mockResolvedValueOnce(null);
      
      // Expect the service to throw NotFoundException
      await expect(service.getRisks(999))
        .rejects.toThrow(NotFoundException);
    });
  });
});
