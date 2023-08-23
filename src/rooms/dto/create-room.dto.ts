import { ApiProperty } from "@nestjs/swagger";

export class CreateRoomDto {
    @ApiProperty()
    room_name: string;

    @ApiProperty()
    client_number: number

    @ApiProperty()
    bed_room: number

    @ApiProperty()
    bed: number

    @ApiProperty()
    bath_room: number

    @ApiProperty()
    description: string

    @ApiProperty()
    price: number

    @ApiProperty()
    washing_machine: boolean

    @ApiProperty()
    iron: boolean

    @ApiProperty()
    tivi: boolean

    @ApiProperty()
    air_conditioner: boolean

    @ApiProperty()
    wifi: boolean

    @ApiProperty()
    kitchen: boolean

    @ApiProperty()
    parking: boolean

    @ApiProperty()
    pool: boolean

    @ApiProperty()
    location_id: number

    @ApiProperty()
    image: string 
}
