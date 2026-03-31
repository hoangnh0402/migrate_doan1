// Copyright (c) 2025 HQC System Contributors
// Licensed under the GNU General Public License v3.0 (GPL-3.0)

/**
 * SPARQL Query Service for Apache Jena Fuseki
 * Provides typed queries and results for LOD Cloud visualization
 */

import { getFusekiUrl } from './environment';

// =============================================================================
// TYPES
// =============================================================================

export interface SparqlBinding {
  type: 'uri' | 'literal' | 'bnode';
  value: string;
  datatype?: string;
  'xml:lang'?: string;
}

export interface SparqlResults {
  head: {
    vars: string[];
  };
  results: {
    bindings: Record<string, SparqlBinding>[];
  };
}

export interface DatasetStats {
  name: string;
  triples: number;
  subjects: number;
  predicates: number;
  objects: number;
  lastSync?: string;
}

export interface EntityType {
  type: string;
  count: number;
  label?: string;
}

export interface DatasetLink {
  source: string;
  target: string;
  linkCount: number;
}

// =============================================================================
// FUSEKI CONFIG
// =============================================================================

export const FUSEKI_CONFIG = {
  // Will be auto-detected based on environment
  get endpoint() {
    return getFusekiUrl();
  },
  adminEndpoint: '/$/datasets',
  username: 'admin',
  password: 'admin',
  defaultDataset: 'HQC System',
  
  // HQC System datasets
  datasets: [
    { id: 'HQC System', name: 'HQC System Unified', description: 'All HQC System data combined' },
    { id: 'HQC System-ontology', name: 'Ontology', description: 'HQC System Ontology definitions' },
    { id: 'HQC System-places', name: 'Places', description: 'Hanoi districts and locations' },
    { id: 'HQC System-weather', name: 'Weather', description: 'Weather observations' },
    { id: 'HQC System-airquality', name: 'Air Quality', description: 'Air quality measurements' },
    { id: 'HQC System-traffic', name: 'Traffic', description: 'Traffic flow data' },
    { id: 'HQC System-parking', name: 'Parking', description: 'Parking spots and availability' },
    { id: 'HQC System-civic', name: 'Civic Issues', description: 'Urban infrastructure reports' },
  ],
};

// =============================================================================
// SPARQL SERVICE
// =============================================================================

export class SparqlService {
  private baseUrl: string;
  private timeout: number;
  
  constructor(baseUrl?: string, timeout: number = 30000) {
    this.baseUrl = baseUrl || getFusekiUrl();
    this.timeout = timeout;
  }
  
  /**
   * Execute a SPARQL SELECT query
   */
  async query(dataset: string, sparql: string): Promise<SparqlResults> {
    const url = `${this.baseUrl}/${dataset}/sparql`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sparql-query',
          'Accept': 'application/sparql-results+json',
        },
        body: sparql,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`SPARQL query failed: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('SPARQL query timeout');
      }
      throw error;
    }
  }
  
  /**
   * Execute a SPARQL query via GET (for simple queries)
   */
  async queryGet(dataset: string, sparql: string): Promise<SparqlResults> {
    const url = `${this.baseUrl}/${dataset}/sparql?query=${encodeURIComponent(sparql)}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/sparql-results+json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`SPARQL query failed: ${response.status}`);
    }
    
    return await response.json();
  }
  
  /**
   * Check if Fuseki is online
   */
  async checkStatus(): Promise<'online' | 'offline' | 'checking'> {
    try {
      const response = await fetch(`${this.baseUrl}/$/ping`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok ? 'online' : 'offline';
    } catch {
      return 'offline';
    }
  }
  
  /**
   * Get list of datasets
   */
  async getDatasets(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/$/datasets`, {
        headers: { 'Accept': 'application/json' },
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.datasets?.map((d: { ds: { name: string } }) => d.ds.name.replace('/', '')) || [];
    } catch {
      return [];
    }
  }
  
  /**
   * Get triple count for a dataset
   */
  async getTripleCount(dataset: string): Promise<number> {
    try {
      const result = await this.query(dataset, 
        'SELECT (COUNT(*) as ?count) WHERE { ?s ?p ?o }'
      );
      
      const countBinding = result.results.bindings[0]?.count;
      return countBinding ? parseInt(countBinding.value) : 0;
    } catch {
      return 0;
    }
  }
  
  /**
   * Get dataset statistics
   */
  async getDatasetStats(dataset: string): Promise<DatasetStats> {
    const queries = {
      triples: 'SELECT (COUNT(*) as ?count) WHERE { ?s ?p ?o }',
      subjects: 'SELECT (COUNT(DISTINCT ?s) as ?count) WHERE { ?s ?p ?o }',
      predicates: 'SELECT (COUNT(DISTINCT ?p) as ?count) WHERE { ?s ?p ?o }',
      objects: 'SELECT (COUNT(DISTINCT ?o) as ?count) WHERE { ?s ?p ?o }',
    };
    
    const stats: DatasetStats = {
      name: dataset,
      triples: 0,
      subjects: 0,
      predicates: 0,
      objects: 0,
    };
    
    try {
      const results = await Promise.all([
        this.query(dataset, queries.triples),
        this.query(dataset, queries.subjects),
        this.query(dataset, queries.predicates),
        this.query(dataset, queries.objects),
      ]);
      
      stats.triples = parseInt(results[0].results.bindings[0]?.count?.value || '0');
      stats.subjects = parseInt(results[1].results.bindings[0]?.count?.value || '0');
      stats.predicates = parseInt(results[2].results.bindings[0]?.count?.value || '0');
      stats.objects = parseInt(results[3].results.bindings[0]?.count?.value || '0');
    } catch (error) {
      console.error(`Failed to get stats for ${dataset}:`, error);
    }
    
    return stats;
  }
  
  /**
   * Get entity types in a dataset
   */
  async getEntityTypes(dataset: string): Promise<EntityType[]> {
    const query = `
      SELECT ?type (COUNT(?s) as ?count)
      WHERE {
        ?s a ?type .
      }
      GROUP BY ?type
      ORDER BY DESC(?count)
      LIMIT 20
    `;
    
    try {
      const result = await this.query(dataset, query);
      return result.results.bindings.map(binding => ({
        type: binding.type.value,
        count: parseInt(binding.count.value),
      }));
    } catch {
      return [];
    }
  }
  
  /**
   * Get sample entities from a dataset
   */
  async getSampleEntities(dataset: string, type?: string, limit: number = 10): Promise<Record<string, SparqlBinding>[]> {
    let query = `
      SELECT ?s ?p ?o
      WHERE {
        ${type ? `?s a <${type}> .` : ''}
        ?s ?p ?o .
      }
      LIMIT ${limit * 3}
    `;
    
    try {
      const result = await this.query(dataset, query);
      return result.results.bindings;
    } catch {
      return [];
    }
  }
  
  /**
   * Get cross-dataset links (owl:sameAs)
   */
  async getCrossDatasetLinks(): Promise<DatasetLink[]> {
    // For simplicity, return predefined links based on ontology
    // In production, would query actual owl:sameAs relationships
    return [
      { source: 'HQC System-places', target: 'HQC System-weather', linkCount: 12 },
      { source: 'HQC System-places', target: 'HQC System-airquality', linkCount: 8 },
      { source: 'HQC System-places', target: 'HQC System-traffic', linkCount: 10 },
      { source: 'HQC System-weather', target: 'HQC System-airquality', linkCount: 10 },
      { source: 'HQC System-traffic', target: 'HQC System-parking', linkCount: 15 },
      { source: 'HQC System-civic', target: 'HQC System-traffic', linkCount: 8 },
      { source: 'HQC System-ontology', target: 'HQC System-weather', linkCount: 5 },
      { source: 'HQC System-ontology', target: 'HQC System-airquality', linkCount: 5 },
      { source: 'HQC System-ontology', target: 'HQC System-traffic', linkCount: 5 },
      { source: 'HQC System-ontology', target: 'HQC System-parking', linkCount: 5 },
      { source: 'HQC System-ontology', target: 'HQC System-civic', linkCount: 5 },
      { source: 'HQC System-ontology', target: 'HQC System-places', linkCount: 5 },
    ];
  }
}

// =============================================================================
// SAMPLE SPARQL QUERIES
// =============================================================================

export const SAMPLE_QUERIES = [
  {
    name: 'Táº¥t cáº£ Entities',
    description: 'Liá»‡t kÃª táº¥t cáº£ entities trong dataset',
    query: `SELECT ?subject ?predicate ?object
WHERE {
  ?subject ?predicate ?object
}
LIMIT 100`,
  },
  {
    name: 'Äáº¿m Triples',
    description: 'Äáº¿m tá»•ng sá»‘ triples trong dataset',
    query: `SELECT (COUNT(*) as ?total)
WHERE {
  ?s ?p ?o
}`,
  },
  {
    name: 'Entity Types',
    description: 'Liá»‡t kÃª cÃ¡c loáº¡i entity vÃ  sá»‘ lÆ°á»£ng',
    query: `SELECT ?type (COUNT(?s) as ?count)
WHERE {
  ?s a ?type .
}
GROUP BY ?type
ORDER BY DESC(?count)`,
  },
  {
    name: 'Weather Observations',
    description: 'Láº¥y dá»¯ liá»‡u quan tráº¯c thá»i tiáº¿t',
    query: `PREFIX sosa: <http://www.w3.org/ns/sosa/>
PREFIX HQC System: <https://HQC System.vn/ontology/>

SELECT ?observation ?temp ?humidity ?time
WHERE {
  ?observation a sosa:Observation .
  OPTIONAL { ?observation HQC System:temperature ?temp }
  OPTIONAL { ?observation HQC System:relativeHumidity ?humidity }
  OPTIONAL { ?observation sosa:resultTime ?time }
}
LIMIT 50`,
  },
  {
    name: 'Air Quality AQI > 100',
    description: 'TÃ¬m cÃ¡c quan tráº¯c cháº¥t lÆ°á»£ng khÃ´ng khÃ­ kÃ©m',
    query: `PREFIX HQC System: <https://HQC System.vn/ontology/>
PREFIX sosa: <http://www.w3.org/ns/sosa/>

SELECT ?observation ?aqi ?pm25 ?time
WHERE {
  ?observation HQC System:airQualityIndex ?aqi .
  FILTER(?aqi > 100)
  OPTIONAL { ?observation HQC System:pm25 ?pm25 }
  OPTIONAL { ?observation sosa:resultTime ?time }
}
ORDER BY DESC(?aqi)
LIMIT 20`,
  },
  {
    name: 'Traffic Congestion',
    description: 'Luá»“ng giao thÃ´ng vÃ  má»©c Ä‘á»™ táº¯c ngháº½n',
    query: `PREFIX HQC System: <https://HQC System.vn/ontology/>
PREFIX sosa: <http://www.w3.org/ns/sosa/>

SELECT ?obs ?road ?level ?speed
WHERE {
  ?obs HQC System:congestionLevel ?level .
  OPTIONAL { ?obs HQC System:roadName ?road }
  OPTIONAL { ?obs HQC System:averageSpeed ?speed }
}
ORDER BY DESC(?level)
LIMIT 20`,
  },
  {
    name: 'Parking Availability',
    description: 'BÃ£i Ä‘á»— xe cÃ²n chá»— trá»‘ng',
    query: `PREFIX HQC System: <https://HQC System.vn/ontology/>

SELECT ?parking ?name ?total ?available ?occupancy
WHERE {
  ?parking HQC System:parkingName ?name .
  ?parking HQC System:totalSpaces ?total .
  ?parking HQC System:availableSpaces ?available .
  OPTIONAL { ?parking HQC System:occupancy ?occupancy }
}
ORDER BY DESC(?available)`,
  },
  {
    name: 'Civic Issues by Status',
    description: 'Thá»‘ng kÃª váº¥n Ä‘á» Ä‘Ã´ thá»‹ theo tráº¡ng thÃ¡i',
    query: `PREFIX HQC System: <https://HQC System.vn/ontology/>

SELECT ?status (COUNT(?issue) as ?count)
WHERE {
  ?issue a HQC System:CivicIssue .
  ?issue HQC System:status ?status .
}
GROUP BY ?status
ORDER BY DESC(?count)`,
  },
  {
    name: 'Hanoi Districts',
    description: 'Danh sÃ¡ch quáº­n/huyá»‡n HÃ  Ná»™i',
    query: `PREFIX HQC System: <https://HQC System.vn/ontology/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX wgs84: <http://www.w3.org/2003/01/geo/wgs84_pos#>

SELECT ?district ?name ?lat ?long ?population
WHERE {
  ?district a HQC System:District .
  ?district rdfs:label ?name .
  FILTER(LANG(?name) = "en")
  OPTIONAL { ?district wgs84:lat ?lat }
  OPTIONAL { ?district wgs84:long ?long }
  OPTIONAL { ?district HQC System:population ?population }
}`,
  },
  {
    name: 'Geographic Entities',
    description: 'Entities cÃ³ vá»‹ trÃ­ Ä‘á»‹a lÃ½',
    query: `PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX wgs84: <http://www.w3.org/2003/01/geo/wgs84_pos#>

SELECT ?entity ?lat ?long
WHERE {
  ?entity wgs84:lat ?lat .
  ?entity wgs84:long ?long .
}
LIMIT 100`,
  },
  {
    name: 'External Links',
    description: 'LiÃªn káº¿t vá»›i Wikidata/DBpedia',
    query: `PREFIX owl: <http://www.w3.org/2002/07/owl#>

SELECT ?local ?external
WHERE {
  ?local owl:sameAs ?external .
  FILTER(STRSTARTS(STR(?external), "http://www.wikidata.org/") 
      || STRSTARTS(STR(?external), "http://dbpedia.org/"))
}
LIMIT 50`,
  },
];

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let sparqlServiceInstance: SparqlService | null = null;

export function getSparqlService(): SparqlService {
  if (!sparqlServiceInstance) {
    sparqlServiceInstance = new SparqlService();
  }
  return sparqlServiceInstance;
}

export default SparqlService;

