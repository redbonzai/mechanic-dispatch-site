import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { MechanicsService } from '../../src/domains/mechanics/services/mechanics.service';
import { TestDbHelper } from '../helpers/test-db.helper';
import { CreateMechanicData } from '../../src/domains/mechanics/interfaces';

describe.skip('Mechanics Integration Tests', () => {
  let service: MechanicsService;
  let dbHelper: TestDbHelper;
  let module: TestingModule;

  beforeAll(async () => {
    dbHelper = new TestDbHelper();
    await dbHelper.cleanDatabase();
    await dbHelper.seedTestData();

    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<MechanicsService>(MechanicsService);
  });

  afterAll(async () => {
    await dbHelper.cleanDatabase();
    await dbHelper.disconnect();
    await module.close();
  });

  describe('getMechanics', () => {
    it('should return mechanics from database', async () => {
      const mechanics = await service.getMechanics();

      expect(mechanics.length).toBeGreaterThan(0);
      expect(mechanics[0]).toHaveProperty('id');
      expect(mechanics[0]).toHaveProperty('name');
      expect(mechanics[0]).toHaveProperty('slug');
    });

    it('should filter by isActive status', async () => {
      const activeMechanics = await service.getMechanics(true);
      const allMechanics = await service.getMechanics();

      expect(activeMechanics.length).toBeLessThanOrEqual(allMechanics.length);
      activeMechanics.forEach((mechanic) => {
        expect(mechanic.isActive).toBe(true);
      });
    });
  });

  describe('createMechanic', () => {
    it('should create a new mechanic in database', async () => {
      const createData: CreateMechanicData = {
        name: 'Integration Test Mechanic',
        slug: `integration-test-${Date.now()}`,
        bio: 'Integration test bio',
        location: 'Test Location',
        yearsExperience: 5,
        sinceYear: 2020,
        isActive: true,
      };

      const created = await service.createMechanic(createData);

      expect(created).toBeDefined();
      expect(created.name).toBe(createData.name);
      expect(created.slug).toBe(createData.slug);

      // Verify it can be retrieved
      const retrieved = await service.getMechanic(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe(createData.name);
    });
  });

  describe('updateMechanic', () => {
    it('should update mechanic in database', async () => {
      const mechanics = await service.getMechanics();
      const mechanic = mechanics[0];

      const updated = await service.updateMechanic(mechanic.id, {
        name: 'Updated Name',
      });

      expect(updated.name).toBe('Updated Name');

      // Verify update persisted
      const retrieved = await service.getMechanic(mechanic.id);
      expect(retrieved?.name).toBe('Updated Name');
    });
  });

  describe('deleteMechanic', () => {
    it('should delete mechanic from database', async () => {
      const createData: CreateMechanicData = {
        name: 'To Be Deleted',
        slug: `to-be-deleted-${Date.now()}`,
        bio: 'Will be deleted',
        location: 'Test',
        yearsExperience: 1,
        sinceYear: 2023,
        isActive: true,
      };

      const created = await service.createMechanic(createData);
      await service.deleteMechanic(created.id);

      // Verify deletion
      const retrieved = await service.getMechanic(created.id);
      expect(retrieved).toBeNull();
    });
  });
});
