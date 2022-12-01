import digiData from '../../../database/DataSourceMain'

export default async function handler(req, res) {
  res.status(200).json({ results: digiData }); 
}  