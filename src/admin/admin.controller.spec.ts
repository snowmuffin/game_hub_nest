import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminUserService, VerifyAccessResponse } from './admin-user.service';
import { ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

class AdminUserServiceMock {
  verifyAccess = jest.fn<Promise<VerifyAccessResponse>, [number]>();
}

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminUserServiceMock;

  beforeEach(async () => {
    service = new AdminUserServiceMock();

    const moduleBuilder = Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminUserService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true });

    const module: TestingModule = await moduleBuilder.compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should return success when service says admin', async () => {
    const now = new Date().toISOString();
    service.verifyAccess.mockResolvedValue({
      isAdmin: true,
      adminData: {
        steamId: '123',
        username: 'admin',
        isAdmin: true,
        adminLevel: 1,
        lastAdminAccess: now,
      },
      sessionExpiry: now,
    });

    const res = await controller.verifyAccess({ user: { id: 1 } });
    expect(res.isAdmin).toBe(true);
    expect(res.adminData?.adminLevel).toBe(1);
  });

  it('should throw Forbidden when not admin', async () => {
    service.verifyAccess.mockResolvedValue({ isAdmin: false });
    await expect(
      controller.verifyAccess({ user: { id: 2 } }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
