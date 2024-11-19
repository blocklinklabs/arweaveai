local json = require("json")

-- Initialize state to store models
State = {
    Models = {},
    Owner = ""  -- Optional: track contract owner
}

function Log(msg)
    print(msg)
end

-- Helper function to handle JSON messages
function Handle(type, fn)
    Handlers.add(
        type,
        Handlers.utils.hasMatchingTag("Action", type),
        function(msg)
            local Result = fn(msg)
            if Result == nil then
                return
            end
            Handlers.utils.reply(Result)(msg)
        end
    )
end

-- Register a new model
Handle("RegisterModel", function(msg)
    local From = msg.From
    
    -- Extract model details from tags
    local name = msg.Tags.name
    local description = msg.Tags.description
    local modelType = msg.Tags.modelType
    local repo = msg.Tags.repo
    local dataset = msg.Tags.dataset
    local deployment = msg.Tags.deployment
    local tags = msg.Tags.tags

    -- Create model entry
    State.Models[name] = {
        name = name,
        owner = From,
        description = description,
        modelType = modelType,
        repo = repo,
        dataset = dataset,
        deployment = deployment,
        tags = tags,
        timestamp = os.time()
    }

    return json.encode({
        status = "success",
        message = "Model registered successfully"
    })
end)

-- Get all models
Handle("GetModels", function(msg)
    return json.encode(State.Models)
end)

-- Get a specific model by name
Handle("GetModel", function(msg)
    local modelName = msg.Tags.name
    if State.Models[modelName] then
        return json.encode(State.Models[modelName])
    else
        return json.encode({
            status = "error",
            message = "Model not found"
        })
    end
end)

-- Update model details (only by owner)
Handle("UpdateModel", function(msg)
    local From = msg.From
    local modelName = msg.Tags.name
    
    -- Check if model exists and sender is owner
    if State.Models[modelName] and State.Models[modelName].owner == From then
        -- Update allowed fields
        if msg.Tags.description then
            State.Models[modelName].description = msg.Tags.description
        end
        if msg.Tags.repo then
            State.Models[modelName].repo = msg.Tags.repo
        end
        if msg.Tags.dataset then
            State.Models[modelName].dataset = msg.Tags.dataset
        end
        if msg.Tags.deployment then
            State.Models[modelName].deployment = msg.Tags.deployment
        end
        if msg.Tags.tags then
            State.Models[modelName].tags = msg.Tags.tags
        end
        
        return json.encode({
            status = "success",
            message = "Model updated successfully"
        })
    else
        return json.encode({
            status = "error",
            message = "Unauthorized or model not found"
        })
    end
end)

-- Delete model (only by owner)
Handle("DeleteModel", function(msg)
    local From = msg.From
    local modelName = msg.Tags.name
    
    if State.Models[modelName] and State.Models[modelName].owner == From then
        State.Models[modelName] = nil
        return json.encode({
            status = "success",
            message = "Model deleted successfully"
        })
    else
        return json.encode({
            status = "error",
            message = "Unauthorized or model not found"
        })
    end
end)

-- Search models by type
Handle("SearchModelsByType", function(msg)
    local modelType = msg.Tags.modelType
    local results = {}
    
    for name, model in pairs(State.Models) do
        if model.modelType == modelType then
            results[name] = model
        end
    end
    
    return json.encode(results)
end)