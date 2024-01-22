import swaggerJSDoc from "swagger-jsdoc";
import { ESortingOptions } from "../types/article";
import { Interface } from "readline";

interface Ali {
    name: string
}

const paths:  swaggerJSDoc.Paths = {
    "/" : {
        get: {
            summary: "get all articles",
            description: "get all articles des",
            tags: ["Article"],
            parameters: [
                {
                    in:"query",
                    name:"page",
                    schema: {
                        type: "integer"
                    }
                },
                {
                    in:"query",
                    name:"limit",
                    schema: {
                        type: "integer"
                    }
                }
            ],
            requestBody:{
                content:{
                    "application/json":{
                        schema:{
                            type:"object",
                            properties: {
                                sort:{
                                    type:"array",
                                    items:{
                                        type:"string",
                                        enum: Object.values(ESortingOptions),
                                        default: ESortingOptions.NEWEST_FIRST
                                    }
                                }
                            }
                        }
                    }
                }
            },
            responses:{
                "200":{
                    description: "Success",
                    content: {
                        "application/json":{
                            schema:{
                                type:"string"
                            }
                        }
                    }
                }
            }
        },
        post: {
            summary: 'Create a new article (seller permission)',
            tags: ['Article'],
            requestBody: {
                content: {
                    'application/json': {
                        schema: {},
                    },
                },
                description: 'Description of the request body',
                required: true,
            },
            responses: {
                '200': {
                    description: 'Successful response',
                    content: {
                        'application/json': {
                            schema: {
                                // Define response schema
                            },
                        },
                    },
                },
                // Add more response codes as needed
            },
        },
    }
}

export default {
    paths
}