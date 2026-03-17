import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../../database/prisma.service';
import { RepairAggregatorService } from '../../repair-apis/services/repair-aggregator.service';

describe('SearchService', () => {
  let service: SearchService;

  const mockGuide = {
    externalId: 'guide_1',
    source: 'INTERNAL' as const,
    title: 'Brake Pad Replacement',
    symptom: 'brake squealing',
    systemCategory: 'BRAKES',
    difficulty: 'INTERMEDIATE' as const,
    diyFriendly: true,
    estimatedCostMinCents: 5000,
    estimatedCostMaxCents: 15000,
    timeEstimateMinutes: 90,
    steps: [{ order: 1, description: 'Lift vehicle' }],
    tools: ['Jack', 'Wrench'],
    parts: ['Brake pads'],
    warnings: ['Use jack stands'],
    relatedSkills: ['Brake Service'],
  };

  const mockMechanic = {
    id: 'mech_1',
    name: 'Mike Torque',
    slug: 'mike-torque',
    imageUrl: null,
    location: 'Austin, TX',
    rating: 4.8,
    reviewCount: 20,
    subscriptionTier: 'PRO',
    website: 'https://mike.com',
    phone: '555-0100',
    profileViews: 150,
    skills: [{ skill: { name: 'Brake Service' } }],
  };

  const mockPrisma = {
    skill: {
      findMany: jest.fn(),
    },
    mechanic: {
      findMany: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      update: jest.fn().mockResolvedValue({}),
    },
    searchQuery: {
      create: jest.fn().mockResolvedValue({}),
    },
    user: {
      update: jest.fn().mockResolvedValue({}),
    },
    mechanicProfileView: {
      create: jest.fn().mockResolvedValue({}),
    },
  };

  const mockAggregator = {
    search: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RepairAggregatorService, useValue: mockAggregator },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    void module.get(PrismaService);
    void module.get(RepairAggregatorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── searchFixes ────────────────────────────────────────────────────────────

  describe('searchFixes', () => {
    beforeEach(() => {
      mockAggregator.search.mockResolvedValue([mockGuide]);
      mockPrisma.skill.findMany.mockResolvedValue([
        { id: 'skill_1', name: 'Brake Service' },
      ]);
      mockPrisma.mechanic.findMany.mockResolvedValue([mockMechanic]);
    });

    it('should return guides and mechanics for a valid query', async () => {
      const result = await service.searchFixes({ q: 'brake squealing' });

      expect(result.query).toBe('brake squealing');
      expect(result.guides).toHaveLength(1);
      expect(result.guides[0].title).toBe('Brake Pad Replacement');
      expect(result.mechanics).toHaveLength(1);
      expect(result.mechanics[0].name).toBe('Mike Torque');
    });

    it('should call aggregator with correct vehicle params', async () => {
      await service.searchFixes({
        q: 'brake squealing',
        make: 'Toyota',
        model: 'Camry',
        year: 2018,
      });

      expect(mockAggregator.search).toHaveBeenCalledWith({
        symptom: 'brake squealing',
        make: 'Toyota',
        model: 'Camry',
        year: 2018,
        vin: undefined,
      });
    });

    it('should record the search query for analytics', async () => {
      await service.searchFixes({ q: 'oil leak' });

      expect(mockPrisma.searchQuery.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ query: 'oil leak' }),
        }),
      );
    });

    it('should increment user searchCount when userId provided', async () => {
      await service.searchFixes({ q: 'battery dead' }, 'user_1');

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user_1' },
          data: { searchCount: { increment: 1 } },
        }),
      );
    });

    it('should not increment user searchCount when anonymous', async () => {
      await service.searchFixes({ q: 'battery dead' });

      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('should return empty mechanics array when no skills match', async () => {
      mockPrisma.skill.findMany.mockResolvedValue([]);
      mockPrisma.mechanic.findMany.mockResolvedValue([]);

      const result = await service.searchFixes({ q: 'unknown problem xyz' });

      expect(result.mechanics).toHaveLength(0);
    });

    it('should handle aggregator failure gracefully', async () => {
      mockAggregator.search.mockRejectedValue(new Error('API down'));

      await expect(service.searchFixes({ q: 'engine noise' })).rejects.toThrow(
        'API down',
      );
    });

    it('should increment searchAppearances for matching mechanics', async () => {
      await service.searchFixes({ q: 'brake noise' });

      expect(mockPrisma.mechanic.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { in: ['mech_1'] } },
          data: { searchAppearances: { increment: 1 } },
        }),
      );
    });
  });

  // ── trackMechanicView ──────────────────────────────────────────────────────

  describe('trackMechanicView', () => {
    it('should create a profile view record', async () => {
      await service.trackMechanicView('mech_1', {
        source: 'search_result',
        clickedLink: false,
      });

      expect(mockPrisma.mechanicProfileView.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ mechanicId: 'mech_1' }),
        }),
      );
    });

    it('should increment profileViews on view', async () => {
      await service.trackMechanicView('mech_1', { clickedLink: false });

      expect(mockPrisma.mechanic.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'mech_1' },
          data: expect.objectContaining({
            profileViews: { increment: 1 },
          }),
        }),
      );
    });

    it('should increment linkClicks when clickedLink=true', async () => {
      await service.trackMechanicView('mech_1', {
        source: 'profile_page',
        clickedLink: true,
      });

      expect(mockPrisma.mechanic.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            linkClicks: { increment: 1 },
          }),
        }),
      );
    });

    it('should not increment linkClicks when clickedLink=false', async () => {
      await service.trackMechanicView('mech_1', { clickedLink: false });

      expect(mockPrisma.mechanic.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({ linkClicks: expect.anything() }),
        }),
      );
    });
  });
});
