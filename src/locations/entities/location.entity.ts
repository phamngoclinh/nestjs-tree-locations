import { Column, Entity, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent } from 'typeorm';

@Entity()
@Tree("closure-table")
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column()
  building: string;

  @Column()
  area: number;

  @TreeChildren()
  children: Location[]

  @TreeParent()
  parent: Location
}
