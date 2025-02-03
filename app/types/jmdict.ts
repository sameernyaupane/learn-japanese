export interface JMdictImage {
    id: number;
    ent_seq: number;
    filename: string;
    image_url: string;
    created_at: Date;
    updated_at: Date;
  } 

export interface JMdictEntry {
  frequency?: string;
  priority?: string[];
} 