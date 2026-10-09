/** What HAB asks of any language model. Which model answers is the owner's choice, made in Home Assistant. */
export interface TextRequest {
  taskName: string;
  instructions: string;
}

export interface TextGenerator {
  generate(request: TextRequest): Promise<string>;
}

/** Facts given to the model. Plain values only, so nothing private leaks by accident. */
export type Facts = Record<string, string | number | null>;
