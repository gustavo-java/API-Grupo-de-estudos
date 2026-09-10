import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

export const uploadDirectory = () =>
  resolve(process.env.UPLOAD_DIR || 'uploads');

@Injectable()
export class ProductImageService {
  async save(file?: { buffer: Buffer }) {
    if (!file?.buffer?.length)
      throw new BadRequestException('Selecione uma imagem.');
    let image: Buffer;
    try {
      const input = sharp(file.buffer, {
        limitInputPixels: 25000000,
        animated: false,
      });
      const metadata = await input.metadata();
      if (!['jpeg', 'png', 'webp'].includes(metadata.format || '')) {
        throw new Error('Unsupported image');
      }
      image = await input
        .rotate()
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
    } catch {
      throw new BadRequestException(
        'Imagem inválida. Envie JPG, PNG ou WebP de até 5 MB e 25 megapixels.',
      );
    }
    const filename = `${randomUUID()}.webp`;
    await mkdir(uploadDirectory(), { recursive: true });
    await writeFile(resolve(uploadDirectory(), filename), image, {
      flag: 'wx',
    });
    return { url: `/uploads/${filename}` };
  }
}
