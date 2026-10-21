export type Neighborhood = 'Djurgården' | 'Södermalm' | 'Gamla Stan' | 'Norrmalm' | 'Skeppsholmen';

export type Category = 'museum' | 'historic' | 'tech-mba' | 'eats-fika' | 'nightlife';

export interface Place {
  id: string;
  title: string;
  neighborhood: Neighborhood;
  category: Category;
  costSek: number;
  costLabel: string;
  durationMin: number;
  isIndoor: boolean;
  rainAlternativeId?: string;
  tag: string;
  transitTip: string;
  mbaNote: string;
  studentDiscountNote: string;
  coordinates: {
    island: Neighborhood;
    lat: number;
    lng: number;
  };
}
