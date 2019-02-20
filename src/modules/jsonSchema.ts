export type JsonSchemaLiteral = string | number | boolean

// Complex as opposed to literal - can't find a better word
export interface JsonSchemaComplex {
    additionalProperties?: boolean
    allOf?: JsonSchema[]
    description?: string
    enum?: JsonSchemaLiteral[]
    items?: JsonSchema | JsonSchema[]
    properties?: { [key: string]: JsonSchema }
    required?: string[]
    type?: string
}

export type JsonSchema = JsonSchemaLiteral | JsonSchemaComplex

export function buildLiteral(literal: string | boolean | number): JsonSchema {
    return literal
}

function buildPrimitive(type: string): JsonSchema {
    switch (type) {
        case 'any':
            return buildAny()
        case 'void':
            return { type: 'undefined' }
        case 'null':
            return { type: 'null' }
        case 'undefined':
            return { type: 'undefined' }
        case 'never':
            return { description: 'This is a never type', allOf: [{ type: 'string' }, { type: 'number' }] }
        case 'string':
            return { type: 'string' }
        case 'number':
            return { type: 'number' }
        case 'boolean':
            return { type: 'boolean' }

        default:
            throw new Error(`Unsupported type please open an issue on github`)
    }
}

function buildArray(resolvedType: JsonSchema): JsonSchema {
    return { type: 'array', items: resolvedType }
}

function buildTuple(resolvedTypes: JsonSchema[]): JsonSchema {
    return { type: 'array', items: resolvedTypes }
}

function buildEnum(resolvedEnum: Array<[string, JsonSchema]>): JsonSchema {
    return { enum: resolvedEnum.map(([_, schema]) => schema as JsonSchemaLiteral) }
}

function buildObject(properties: Array<{ isOptional: boolean; name: string; resolvedType: JsonSchema }>): JsonSchema {
    const schema = {
        additionalProperties: false,
        properties: {} as { [key: string]: JsonSchema },
        required: [] as string[],
        type: 'object',
    }

    properties.forEach(({ isOptional, name, resolvedType }) => {
        if (!isOptional) schema.required.push(name)
        schema.properties[name] = resolvedType
    })

    // Remove the required if it's not required
    if (schema.required.length === 0) delete schema.required

    return schema
}

function buildIndexableObject(resolvedType: JsonSchema) {
    return {
        additionalProperties: false,
        patternProperties: { '.*': resolvedType },
        properties: {}, // Don't know if this is needed, taken from http://json-schema.org/example2.html
        type: 'object',
    }
}

function buildAny() {
    return {}
}

export const module = {
    buildAny,
    buildArray,
    buildEnum,
    buildIndexableObject,
    buildLiteral,
    buildObject,
    buildPrimitive,
    buildTuple,
}
