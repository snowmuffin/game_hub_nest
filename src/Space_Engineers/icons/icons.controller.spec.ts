import { Test, TestingModule } from '@nestjs/testing';
import { IconsController } from './icons.controller';
import { IconsService } from './icons.service';

describe('IconsController', () => {
  let controller: IconsController;
  let service: IconsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IconsController],
      providers: [
        {
          provide: IconsService,
          useValue: {
            uploadIcon: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<IconsController>(IconsController);
    service = module.get<IconsService>(IconsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadIcon', () => {
    it('should upload icon successfully', async () => {
      const dto = {
        fileName: 'Textures\\GUI\\Icons\\Cubes\\LargeBlockArmorBlock.dds',
        data: 'RERTIHwAAAB/DwAAPBAAAED7BwAAAAAABAAAAP////8AAAAA',
        mimeType: 'image/vnd-ms.dds',
      };

      const result = {
        success: true,
        fileName: dto.fileName,
        url: 'https://se-hangar.s3.ap-northeast-2.amazonaws.com/icons/LargeBlockArmorBlock.dds',
      };

      jest.spyOn(service, 'uploadIcon').mockResolvedValue(result);

      const uploadResult = await controller.uploadIcon(dto);

      expect(uploadResult).toEqual(result);
    });
  });
});
