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
  },
  {
    id: 'precast-hollow-pots',
    name: 'Precast Hollow Pots',
    category: 'structural',
    image: '/precast-hollow-pots.jpg',
    imageAlt: 'Precast Hollow Pots for Suspended Floor Slabs',
    description: 'Lightweight structural precast concrete hollow pots (filler blocks) engineered for suspended floor slab and beam-and-block flooring systems, reducing slab self-weight while guaranteeing thermal and acoustic insulation.',
    specs: ['100mm (4")', '150mm (6")', '200mm (8") Depth', 'Ribbed Floor System'],
    standard: 'BS 8110 Structural Concrete Standard',
    recommendedUse: 'Suspended floor slabs, multi-storey building decking, mezzanine floors & acoustic roof systems'
  },
  {
    id: 'precast-hollow-blocks',
    name: 'Precast Hollow Blocks',
    category: 'structural',
    image: '/precast-hollow-blocks.jpg',
    imageAlt: 'Precast Concrete Hollow Blocks',
    description: 'High-compressive-strength hollow concrete blocks manufactured via precision vibration compaction for rapid wall construction, load-bearing walls, perimeter enclosures, and internal partitions.',
    specs: ['4" (100mm) Partition', '6" (150mm) Standard', '9" (225mm) Heavy Load', 'Cored cavities for rebar'],
    standard: 'KEBS KS 02-95 / BS 6073 Part 1',
    recommendedUse: 'Residential boundary walls, commercial perimeter fencing, warehouse walling & foundation infills'
  },
  {
    id: 'flat-and-t-beams',
    name: 'Flat Beams & T-Beams',
    category: 'structural',
    image: '/flat-and-t-beams.jpg',
    imageAlt: 'Precast Prestressed Flat Beams and T-Beams',
    description: 'Prestressed reinforced concrete T-beams (inverted T-sections) and flat lintel beams designed to span foundations and floor systems alongside hollow pots without extensive timber formwork or propping.',
    specs: ['Inverted T-Section (150mm & 225mm)', 'Flat Lintel Beams (Up to 4.5m Spans)', 'High-Tensile Pre-stressed Tendons'],
    standard: 'BS 8110-1 Structural Concrete Standard',
    recommendedUse: 'Beam & block suspended floor slabs, structural lintels, residential decking & bridge pedestrian spans'
  },
  {
    id: 'louvents',
    name: 'Louvents (Ventilation Blocks)',
    category: 'architectural',
    image: '/louvents.jpg',
    imageAlt: 'Precast Concrete Louvents Architectural Breeze Blocks',
    description: 'Architectural precast decorative ventilation breeze blocks crafted to provide continuous natural airflow, passive solar shading, and privacy with distinctive geometric patterns.',
    specs: ['200mm x 200mm', '225mm x 150mm', 'Geometric X & Screen Patterns', 'Smooth Cast Concrete Finish'],
    standard: 'Architectural Precast Ventilation Standard',
    recommendedUse: 'Basement ventilation, laundry utility enclosures, staircase light shafts, security screen walls & electrical sub-stations'
  },
  {
    id: 'balustrades-and-frames',
    name: 'Balustrades & Concrete Frames',
    category: 'architectural',
    image: '/balustrades-and-frames.jpg',
    imageAlt: 'Precast Concrete Balustrades, Railing Spindles and Door Window Frames',
    description: 'Architectural precast concrete balustrade spindles, coping handrails, and precision window and door frame surrounds engineered for weather durability and timeless building aesthetics.',
    specs: ['Classical Italian Spindles', 'Modern Square Balusters', 'Precast Window Sills & Door Surrounds'],
    standard: 'High Compressive Architectural Stone Spec',
    recommendedUse: 'Balconies, perimeter terraces, exterior grand staircases, estate veranda railings & window surrounds'
  },
  {
    id: 'highway-manhole-covers',
    name: 'Highway Manhole Covers',
    category: 'drainage',
    image: '/highway-manhole-covers.jpg',
    imageAlt: 'Heavy-Duty Precast Highway Manhole Covers and Frames',
    description: 'Heavy-duty steel-reinforced circular precast concrete manhole covers and matching foundation rings formulated to withstand heavy highway wheel axle loads without cracking, theft risk, or dislodging.',
    specs: ['Heavy Duty Class D400 (400kN Axle Load)', 'Medium Duty Class B125', 'Integrated Lifting Eyelets & Non-Slip Tread'],
    standard: 'BS EN 124 / KeNHA Road Infrastructure Spec',
    recommendedUse: 'Highway carriage ways, municipal sewer inspection chambers, storm drain shafts & heavy commercial parking aprons'
  },
  {
    id: 'dobbie-sinks',
    name: 'Dobbie Sinks (Wash Troughs)',
    category: 'architectural',
    image: '/dobbie-sinks.jpg',
    imageAlt: 'Precast Concrete and Terrazzo Dobbie Laundry Wash Sinks',
    description: 'Heavy-duty precast concrete and polished terrazzo laundry wash sinks (dobbie tubs) with reinforced integrated basins, contoured washboards, and standard brass/PVC drainage outlets.',
    specs: ['Single Basin Trough', 'Double Basin (Twin Dobbie)', 'Polished Terrazzo or Smooth Cement Finish', 'Drainage Outlet Pre-Cored'],
    standard: 'Waterproof Compressive Terrazzo Precast Standard',
    recommendedUse: 'Residential outdoor laundry yards, estate utility areas, school dormitories, commercial laundromats & staff quarters'
  }
];
