import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';
import { ApiCommunity } from '../../data-model/api-community';

interface CommunityCreationAttributes extends Optional<ApiCommunity, 'id' | 'template' | 'created_at' | 'updated_at' | 'deleted_at'> {}

class Community extends Model<ApiCommunity, CommunityCreationAttributes> implements ApiCommunity {
  public id!: number;
  public subdomain!: string;
  public name!: string;
  public imageUrl!: string;
  public brandingColor!: string;
  public description!: string;
  public template!: string;
  public polkadotReferenceId!: string;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at!: Date | null;
}

Community.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    subdomain: {
      type: DataTypes.STRING,
      allowNull: false
    },
    brandingColor: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    template: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    polkadotReferenceId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'communities',
    timestamps: false,
    underscored: true
  }
);

export default Community;
