import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ToggleLikeResponse {
  @ApiProperty({
    example: true,
    description: 'Indica si el proveedor quedó con me gusta (true) o si se removió (false)',
  })
  @Expose()
  hasLiked: boolean;

  @ApiProperty({
    example: 15,
    description: 'Nuevo total de me gusta / recomendaciones del proveedor',
  })
  @Expose()
  likesCount: number;

  static fromData(data: { hasLiked: boolean; likesCount: number }): ToggleLikeResponse {
    const res = new ToggleLikeResponse();
    res.hasLiked = data.hasLiked;
    res.likesCount = data.likesCount;
    return res;
  }
}
