var jsonInputArea = document.getElementById("jsoninput");

let x = ""

jsonInputArea.addEventListener("input", function() {
    var text = jsonInputArea.value.trim();

    var jsonObject = undefined;
    try {
        jsonObject = JSON.parse(text);
    } catch (e) {
        console.log("Invalid JSON input");
        return;
    }

    createStruct(jsonObject);
});

function createStruct(jsonObject) {
    var structs = {
        "": {
            swiftStructName: "ModelStruct",
            properties: []
        }
    };

    convertJSONObject(jsonObject, "");

    function convertJSONObject(jsonObject, path) {
        let keys = Object.keys(jsonObject);
    
        keys.forEach(function(key) {
            switch (typeof jsonObject[key]) {
                case "string": 
                    structs[path].properties.push({
                        name: key,
                        type: "String"
                    });
                    break;
                case "number":
                    structs[path].properties.push({
                        name: key,
                        type: isNumberDouble(jsonObject[key]) ? "Double" : "Int"
                    });
                    break;
                case "boolean": 
                    structs[path].properties.push({
                        name: key,
                        type: "Bool"
                    });
                    break;
                case "object": 
                    if (Array.isArray(jsonObject[key])) {
                        structs[path].properties.push({
                            name: key,
                            type: "[" + toPascalCase(key) + "]"
                        });

                        convertJSONArrays(jsonObject[key], path + "/" + key, key); break;
                        
                    } else {
                        structs[path + "/" + key] = {
                            swiftStructName: toPascalCase(key),
                            properties: []
                        }

                        structs[path].properties.push({
                            name: key,
                            type: toPascalCase(key)
                        });

                        convertJSONObject(jsonObject[key], path + "/" + key); break;
                    }
            }
        })
    }

    function convertJSONArrays(jsonObject, path, key) {
        let properties = []

        let isObject = false;

        structs[path] = {
            swiftStructName: toPascalCase(key),
            properties: []
        }

        for (var i = 0; i < jsonObject.length; i++) {
            const value = jsonObject[i];

            switch (typeof value) {
                case "string": 
                    properties.push({
                        name: "",
                        type: "String"
                    });
                    break;
                case "number":
                    properties.push({
                        name: "",
                        type: isNumberDouble(value) ? "Double" : "Int"
                    });
                    break;
                case "boolean": 
                    properties.push({
                        name: "",
                        type: "Bool"
                    });
                    break;
                case "object": 
                    isObject = true;

                    if (Array.isArray(value)) {
                        structs[path + "/" + key] = {
                            swiftStructName: toPascalCase(key),
                            properties: []
                        }

                        properties.push({
                            name: key,
                            type: "[" + toPascalCase(key) + "]"
                        });

                        convertJSONArrays(value, path + "/" + key, key); break;
                    } else {
                        structs[path] = {
                            swiftStructName: toPascalCase(key),
                            properties: []
                        }

                        convertJSONObject(value, path);

                        properties.push(structs[path].properties)

                        break;
                    }
            }
        }

        if (isObject) {
            let allProperties = []

            properties.forEach(propertyEntry => {
                propertyEntry.forEach(property => {
                    allProperties.push(property);
                });
            });

            var propertyChunks = allProperties.reduce(function(result, item) {
                var key = item.name;
                if (!result[key]) {
                    result[key] = [];
                }
                result[key].push(item);
                return result;
            }, {});

            let finalProperties = []

            Object.keys(propertyChunks).forEach(propertyChunkKey => {
                let propertyChunk = propertyChunks[propertyChunkKey];
                let isOptional = propertyChunk.length != jsonObject.length;
                let type = propertyChunk[0].type;

                let error = false;
                propertyChunk.forEach(property => {
                    console.log(property.type, type)
                    if (property.type == type) {
                        return;
                    } else if ((property.type == "Double" || property.type == "Int") && (type == "Double" || type == "Int")) {
                        type = "Double";
                    } else {
                        error = true;
                    }
                });

                if (!error) {
                    finalProperties.push({
                        name: propertyChunkKey,
                        type: type + (isOptional ? "?" : "")
                    });
                }
            })
            structs[path].properties = finalProperties
        } else {
            structs[path].properties = properties
        }
    }

    let output = outputAsSwiftStructs(structs);
    var swiftOutput = document.getElementById("swiftoutput");
    swiftOutput.value = output;
}

function outputAsSwiftStructs(structs) {
    var output = ""

    for (var structPath in structs) {
        const value = structs[structPath];
        output += "struct " + value.swiftStructName + " {\n"

        value.properties.forEach(property => {
            output += "    var " + property.name + ": " + property.type + "\n"
        });

        output += "}\n\n"
    }

    return output;
}

function toPascalCase(str) {
    return str.replace(/(\w)(\w*)/g, function(g0, g1, g2){
        return g1.toUpperCase() + g2.toLowerCase();
    });
}

function isNumberDouble(num) {
    return num !== Math.floor(num);
}