import { Test, TestingModule } from '@nestjs/testing';
import { MechanicsService } from './mechanics.service';
import { MechanicAbstract } from '../repositories';
import { ReviewAbstract } from '../repositories';
import { SkillAbstract } from '../skills/repositories';
import { MECHANIC_REPOSITORY, REVIEW_REPOSITORY, SKILL_REPOSITORY } from '../repositories';
import { CreateMechanicData, UpdateMechanicData } from '../interfaces';
import { Mechanic } from '../entities/mechanic.entity';

describe('MechanicsService', () => {
  let service: MechanicsService;
  let mechanicRepository: jest.Mocked<MechanicAbstract>;
  let reviewRepository: jest.Mocked<ReviewAbstract>;
  let skillRepository: jest.Mocked<SkillAbstract>;

  const mockMechanic: Mechanic = Mechanic.create({
    id: 'mech_1',
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Test Mechanic',
    slug: 'test-mechanic',
    bio: 'Test bio',
    imageUrl: null,
    location: 'Test Location',
    yearsExperience: 5,
    rating: 4.5,
    reviewCount: 10,
    jobsCompleted: 100,
    sinceYear: 2020,
    certifications: [],
    badges: [],
    isActive: true,
  });

  beforeEach(async () => {
    const mockMechanicRepo = {
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockReviewRepo = {
      findMany: jest.fn(),
      findById: jest.fn(),
      getStats: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockSkillRepo = {
      findMany: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MechanicsService,
        {
          provide: MECHANIC_REPOSITORY,
          useValue: mockMechanicRepo,
        },
        {
          provide: REVIEW_REPOSITORY,
          useValue: mockReviewRepo,
        },
        {
          provide: SKILL_REPOSITORY,
          useValue: mockSkillRepo,
        },
      ],
    }).compile();

    service = module.get<MechanicsService>(MechanicsService);
    mechanicRepository = module.get(MECHANIC_REPOSITORY);
    reviewRepository = module.get(REVIEW_REPOSITORY);
    skillRepository = module.get(SKILL_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMechanics', () => {
    it('should return all mechanics when no filter provided', async () => {
      mechanicRepository.findMany.mockResolvedValue([mockMechanic]);

      const result = await service.getMechanics();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Mechanic');
      expect(mechanicRepository.findMany).toHaveBeenCalledWith({ isActive: undefined });
    });

    it('should return only active mechanics when isActive=true', async () => {
      mechanicRepository.findMany.mockResolvedValue([mockMechanic]);

      const result = await service.getMechanics(true);

      expect(mechanicRepository.findMany).toHaveBeenCalledWith({ isActive: true });
      expect(result).toHaveLength(1);
    });

    it('should return only inactive mechanics when isActive=false', async () => {
      const inactiveMechanic = Mechanic.create({
        ...mockMechanic.toJSON(),
        id: 'mech_2',
        isActive: false,
      });
      mechanicRepository.findMany.mockResolvedValue([inactiveMechanic]);

      const result = await service.getMechanics(false);

      expect(mechanicRepository.findMany).toHaveBeenCalledWith({ isActive: false });
      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(false);
    });

    it('should return empty array when no mechanics found', async () => {
      mechanicRepository.findMany.mockResolvedValue([]);

      const result = await service.getMechanics();

      expect(result).toHaveLength(0);
    });
  });

  describe('getMechanic', () => {
    it('should return a mechanic by id', async () => {
      mechanicRepository.findById.mockResolvedValue(mockMechanic);

      const result = await service.getMechanic('mech_1');

      expect(result).toBeDefined();
      expect(result?.name).toBe('Test Mechanic');
      expect(mechanicRepository.findById).toHaveBeenCalledWith('mech_1');
    });

    it('should return null when mechanic not found', async () => {
      mechanicRepository.findById.mockResolvedValue(null);

      const result = await service.getMechanic('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getMechanicBySlug', () => {
    it('should return a mechanic by slug', async () => {
      mechanicRepository.findBySlug.mockResolvedValue(mockMechanic);

      const result = await service.getMechanicBySlug('test-mechanic');

      expect(result).toBeDefined();
      expect(result?.slug).toBe('test-mechanic');
      expect(mechanicRepository.findBySlug).toHaveBeenCalledWith('test-mechanic');
    });

    it('should return null when mechanic not found by slug', async () => {
      mechanicRepository.findBySlug.mockResolvedValue(null);

      const result = await service.getMechanicBySlug('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('createMechanic', () => {
    it('should create a new mechanic', async () => {
      const createData: CreateMechanicData = {
        name: 'New Mechanic',
        slug: 'new-mechanic',
        bio: 'New bio',
        location: 'New Location',
        yearsExperience: 3,
        sinceYear: 2021,
        isActive: true,
      };

      mechanicRepository.create.mockResolvedValue(mockMechanic);

      const result = await service.createMechanic(createData);

      expect(result).toBeDefined();
      expect(mechanicRepository.create).toHaveBeenCalledWith(createData);
    });
  });

  describe('updateMechanic', () => {
    it('should update an existing mechanic', async () => {
      const updateData: UpdateMechanicData = {
        name: 'Updated Name',
      };

      const updatedMechanic = Mechanic.create({
        ...mockMechanic.toJSON(),
        name: 'Updated Name',
      });

      mechanicRepository.update.mockResolvedValue(updatedMechanic);

      const result = await service.updateMechanic('mech_1', updateData);

      expect(result.name).toBe('Updated Name');
      expect(mechanicRepository.update).toHaveBeenCalledWith('mech_1', updateData);
    });

    it('should throw error when mechanic not found', async () => {
      mechanicRepository.update.mockRejectedValue(new Error('Mechanic not found'));

      await expect(
        service.updateMechanic('non-existent', { name: 'Test' }),
      ).rejects.toThrow('Mechanic not found');
    });
  });

  describe('deleteMechanic', () => {
    it('should delete a mechanic', async () => {
      mechanicRepository.delete.mockResolvedValue(undefined);

      await service.deleteMechanic('mech_1');

      expect(mechanicRepository.delete).toHaveBeenCalledWith('mech_1');
    });

    it('should throw error when mechanic not found', async () => {
      mechanicRepository.delete.mockRejectedValue(new Error('Mechanic not found'));

      await expect(service.deleteMechanic('non-existent')).rejects.toThrow(
        'Mechanic not found',
      );
    });
  });

  describe('getSkills', () => {
    it('should return all skills', async () => {
      const mockSkills = [
        { id: 'skill_1', name: 'Engine Repair', category: 'Engine' },
        { id: 'skill_2', name: 'Brake Service', category: 'Brakes' },
      ];

      skillRepository.findMany.mockResolvedValue(mockSkills);

      const result = await service.getSkills();

      expect(result).toHaveLength(2);
      expect(skillRepository.findMany).toHaveBeenCalled();
    });
  });
});

