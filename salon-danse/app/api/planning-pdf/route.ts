import { apiFile } from "../../services/api";

export async function GET() {
  return apiFile("/planning/pdf");
}
