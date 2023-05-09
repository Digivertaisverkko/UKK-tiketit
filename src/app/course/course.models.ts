import { Role } from "../core/core.models";

// Metodi: getMyCourses, API: /api/kurssi/omatkurssit/
export interface Kurssini {
  kurssi: number;
  asema: Role;
}
