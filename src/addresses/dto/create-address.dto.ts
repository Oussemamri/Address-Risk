import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsNotEmpty({ message: "Le champ 'q' est requis et doit être une chaîne non vide." })
  @IsString({ message: "Le champ 'q' doit être une chaîne de caractères." })
  q: string;
}