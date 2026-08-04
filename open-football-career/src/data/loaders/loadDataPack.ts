import { dataPackSchema } from '../schemas/dataPackSchema'

export async function loadDataPack(path: string) {
  const response = await fetch(path)
  const data = await response.json()
  return dataPackSchema.parse(data)
}
