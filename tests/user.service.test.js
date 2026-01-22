import { describe, test, expect, mock, beforeEach } from 'bun:test';

// Mock the repository
const mockRepository = {
    findAll: mock(() => Promise.resolve({ data: [], total: 0 })),
    findById: mock(() => Promise.resolve(null)),
    findByEmail: mock(() => Promise.resolve(null)),
    create: mock(() => Promise.resolve({ id: 1, name: 'Test', email: 'test@test.com' })),
    update: mock(() => Promise.resolve({ id: 1, name: 'Updated' })),
    delete: mock(() => Promise.resolve(true)),
};

// Create a test instance of UserService
class TestUserService {
    constructor(repository) {
        this.repository = repository;
    }

    async getAll(query) {
        const { data, total } = await this.repository.findAll({
            page: 1,
            limit: 10,
            offset: 0,
            sortField: 'createdAt',
            sortOrder: 'desc',
        });
        return {
            data,
            pagination: {
                page: 1,
                limit: 10,
                total,
                totalPages: Math.ceil(total / 10),
                hasNext: false,
                hasPrev: false,
            },
        };
    }

    async getById(id) {
        const user = await this.repository.findById(id);
        if (!user) {
            const error = new Error('User not found');
            error.code = 'NOT_FOUND';
            error.status = 404;
            throw error;
        }
        return user;
    }

    async create(data) {
        const existing = await this.repository.findByEmail(data.email);
        if (existing) {
            const error = new Error('Email already registered');
            error.code = 'DUPLICATE_EMAIL';
            error.status = 409;
            throw error;
        }
        return this.repository.create({
            ...data,
            password: 'hashed_' + data.password,
        });
    }

    async update(id, data) {
        await this.getById(id);
        return this.repository.update(id, data);
    }

    async delete(id) {
        await this.getById(id);
        await this.repository.delete(id);
        return true;
    }
}

describe('UserService', () => {
    let userService;

    beforeEach(() => {
        // Reset mocks
        mockRepository.findAll.mockClear();
        mockRepository.findById.mockClear();
        mockRepository.findByEmail.mockClear();
        mockRepository.create.mockClear();
        mockRepository.update.mockClear();
        mockRepository.delete.mockClear();

        userService = new TestUserService(mockRepository);
    });

    describe('getAll', () => {
        test('should return paginated users', async () => {
            const mockUsers = [
                { id: 1, name: 'User 1', email: 'user1@test.com' },
                { id: 2, name: 'User 2', email: 'user2@test.com' },
            ];
            mockRepository.findAll.mockResolvedValueOnce({ data: mockUsers, total: 2 });

            const result = await userService.getAll({ page: '1', limit: '10' });

            expect(result.data).toEqual(mockUsers);
            expect(result.pagination.total).toBe(2);
            expect(mockRepository.findAll).toHaveBeenCalled();
        });

        test('should return empty array when no users', async () => {
            mockRepository.findAll.mockResolvedValueOnce({ data: [], total: 0 });

            const result = await userService.getAll({});

            expect(result.data).toEqual([]);
            expect(result.pagination.total).toBe(0);
        });
    });

    describe('getById', () => {
        test('should return user when found', async () => {
            const mockUser = { id: 1, name: 'Test User', email: 'test@test.com' };
            mockRepository.findById.mockResolvedValueOnce(mockUser);

            const result = await userService.getById(1);

            expect(result).toEqual(mockUser);
            expect(mockRepository.findById).toHaveBeenCalledWith(1);
        });

        test('should throw error when user not found', async () => {
            mockRepository.findById.mockResolvedValueOnce(null);

            try {
                await userService.getById(999);
                expect(true).toBe(false); // Should not reach here
            } catch (error) {
                expect(error.message).toBe('User not found');
                expect(error.code).toBe('NOT_FOUND');
                expect(error.status).toBe(404);
            }
        });
    });

    describe('create', () => {
        test('should create user successfully', async () => {
            const userData = { name: 'New User', email: 'new@test.com', password: 'secret123' };
            const createdUser = { id: 1, name: 'New User', email: 'new@test.com' };

            mockRepository.findByEmail.mockResolvedValueOnce(null);
            mockRepository.create.mockResolvedValueOnce(createdUser);

            const result = await userService.create(userData);

            expect(result).toEqual(createdUser);
            expect(mockRepository.findByEmail).toHaveBeenCalledWith('new@test.com');
            expect(mockRepository.create).toHaveBeenCalled();
        });

        test('should throw error when email already exists', async () => {
            const userData = { name: 'New User', email: 'existing@test.com', password: 'secret123' };
            mockRepository.findByEmail.mockResolvedValueOnce({ id: 1, email: 'existing@test.com' });

            try {
                await userService.create(userData);
                expect(true).toBe(false); // Should not reach here
            } catch (error) {
                expect(error.message).toBe('Email already registered');
                expect(error.code).toBe('DUPLICATE_EMAIL');
                expect(error.status).toBe(409);
            }
        });
    });

    describe('update', () => {
        test('should update user successfully', async () => {
            const existingUser = { id: 1, name: 'Old Name', email: 'test@test.com' };
            const updatedUser = { id: 1, name: 'New Name', email: 'test@test.com' };

            mockRepository.findById.mockResolvedValueOnce(existingUser);
            mockRepository.update.mockResolvedValueOnce(updatedUser);

            const result = await userService.update(1, { name: 'New Name' });

            expect(result).toEqual(updatedUser);
            expect(mockRepository.update).toHaveBeenCalledWith(1, { name: 'New Name' });
        });

        test('should throw error when user not found', async () => {
            mockRepository.findById.mockResolvedValueOnce(null);

            try {
                await userService.update(999, { name: 'New Name' });
                expect(true).toBe(false);
            } catch (error) {
                expect(error.message).toBe('User not found');
            }
        });
    });

    describe('delete', () => {
        test('should delete user successfully', async () => {
            mockRepository.findById.mockResolvedValueOnce({ id: 1 });
            mockRepository.delete.mockResolvedValueOnce(true);

            const result = await userService.delete(1);

            expect(result).toBe(true);
            expect(mockRepository.delete).toHaveBeenCalledWith(1);
        });
    });
});
