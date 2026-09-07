import { PrecastProduct } from '../types';

export const PRECAST_PRODUCTS: PrecastProduct[] = [
  {
    id: 'kabro-paving-blocks',
    name: 'Cabro Paving Blocks',
    category: 'paving',
    image: '/kabro.jpeg',
    imageAlt: 'Cabro Paving Blocks',
    description: 'Interlocking heavy-duty concrete paving blocks engineered for high compressive strength, uniform color, and maximum wear resistance.',
    specs: ['50mm (Walkways)', '60mm (Driveways)', '80mm (Heavy Logistics)'],
    standard: 'KEBS KS 02-1061',
    recommendedUse: 'Residential estates, commercial parking, petrol stations & loading bays'
  },
  {
    id: 'concrete-kerbs',
    name: 'Concrete Kerbs',
    category: 'drainage',
    image: '/concretekerbs.jpeg',
    imageAlt: 'Concrete Kerbs',
    description: 'High-density precision chamfered edge kerb stones formulated to withstand vehicular impact, define carriageways, and prevent road shoulder spread.',
    specs: ['125mm x 250mm', '150mm x 250mm', 'Bullnose & Chamfered'],
    standard: 'BS EN 1340 / KeNHA Standard',
    recommendedUse: 'Highway edging, pedestrian islands, driveways & urban streets'
  },
  {
    id: 'road-channel',
    name: 'Road Channels',
    category: 'drainage',
    image: '/roadchannel.jpg',
    imageAlt: 'Road Channels',
    description: 'Precast concrete road channels and storm drainage edging designed to collect surface rainwater runoff and prevent pavement degradation.',
    specs: ['125mm x 100mm', '150mm x 150mm', 'Tongue & Groove Joint'],
    standard: 'Kenya Roads Board / KeNHA Standards',
    recommendedUse: 'Tarmac road edges, commercial access corridors & parking lots'
  },
  {
    id: 'precast-culverts',
    name: 'Precast Culverts',
    category: 'drainage',
    image: '/culverts.jpeg',
    imageAlt: 'Precast Culverts',
    description: 'Steel-reinforced circular concrete drainage pipes and culverts manufactured using high-frequency vibration compaction for optimum hydraulic flow.',
    specs: ['300mm dia', '450mm dia', '600mm dia', '900mm dia'],
    standard: 'KeNHA / KURA / KeRRA Specification Class A',
    recommendedUse: 'Access road crossings, deep storm trenches & estate storm drains'
  },
  {
    id: 'reinforced-fence-posts',
    name: 'Reinforced Fence Posts',
    category: 'boundary',
    image: '/fencing-posts.jpg',
    imageAlt: 'Reinforced Fence Posts',
    description: 'Prestressed steel-reinforced concrete fencing posts available in cranked security designs and straight configurations. Weatherproof and termite-proof.',
    specs: ['6ft Straight', '7ft Straight', '8ft Cranked Top', '10ft Heavy Duty'],
    standard: 'High Tensile Deformed Steel Bar Rebar',
    recommendedUse: 'Agricultural plots, residential gated enclosures & perimeter security'
  },
  {
    id: 'shallow-drains',
    name: 'Shallow Drains',
    category: 'drainage',
    image: '/shallowdrains.jpg',
    imageAlt: 'Shallow Drains',
    description: 'Precast shallow dish drain units and invert channel blocks designed for efficient surface storm water redirection in low-profile installations.',
    specs: ['300mm Width', '450mm Width', '600mm Dish Drain'],
    standard: 'Continuous hydraulic slope design',
    recommendedUse: 'Gated communities, side walkways, golf paths & garden perimeters'
  },
  {
    id: 'paving-slabs',
    name: 'Precast Paving Slabs',
    category: 'paving',
    image: '/pavingslabs.jpeg',
    imageAlt: 'Precast Paving Slabs',
    description: 'Smooth, high-density precast concrete paving slabs suitable for pedestrian pavements, perimeter aprons, and outdoor terraces.',
    specs: ['600mm x 600mm x 50mm', '450mm x 450mm x 50mm', 'Textured & Plain'],
    standard: 'Heavy Duty Compressive Precast Slabs',
    recommendedUse: 'Pedestrian plazas, building verandas, walkways & garden terraces'
  }
];
