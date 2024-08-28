import { Column, Entity, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent, Unique } from 'typeorm';

@Entity()
@Tree("closure-table")
@Unique('UQ_CODE', ['code'])
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column()
  building: string;

  @Column('float')
  area: number;

  @TreeChildren()
  children: Location[]

  @TreeParent()
  parent: Location
}
