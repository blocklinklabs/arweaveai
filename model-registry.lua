local json = require("json")

-- Initialize state to store models
State = {
    Models = {},
    UserInteractions = {}, -- Track user interactions with models
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
    local name = msg.Tags.name
    State.Models[name] = {
        name = name,
        owner = msg.From,
        description = msg.Tags.description,
        modelType = msg.Tags.modelType,
        repo = msg.Tags.repo,
        dataset = msg.Tags.dataset,
        deployment = msg.Tags.deployment,
        tags = msg.Tags.tags,
        downloadUrl = msg.Tags.downloadUrl,
        category = msg.Tags.category,
        metrics = {
            downloads = 0,
            likes = 0,
            forks = 0
        }
    }
    return json.encode({ status = "success" })
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

-- Helper function to get user interaction key
local function getUserInteractionKey(modelId, userAddress, actionType)
    return modelId .. "_" .. userAddress .. "_" .. actionType
end

-- Update metrics handler with user tracking
Handle("UpdateMetrics", function(msg)
    local modelId = msg.Tags.modelId
    local metricType = msg.Tags.metricType
    local userAddress = msg.Tags.userAddress
    
    if not State.Models[modelId] then
        return json.encode({
            status = "error",
            message = "Model not found"
        })
    end
    
    -- Initialize metrics if they don't exist
    if not State.Models[modelId].metrics then
        State.Models[modelId].metrics = {
            downloads = 0,
            likes = 0,
            forks = 0
        }
    end
    
    -- Initialize user interactions if they don't exist
    if not State.UserInteractions[modelId] then
        State.UserInteractions[modelId] = {}
    end
    
    local interactionKey = getUserInteractionKey(modelId, userAddress, metricType)
    
    -- Check if user has already performed this action
    if metricType == "likes" or metricType == "forks" then
        if State.UserInteractions[modelId][interactionKey] then
            -- If already liked/forked, remove the interaction (toggle)
            State.UserInteractions[modelId][interactionKey] = nil
            State.Models[modelId].metrics[metricType] = 
                math.max(0, (State.Models[modelId].metrics[metricType] or 0) - 1)
            
            return json.encode({
                status = "success",
                message = metricType .. " removed successfully",
                metrics = State.Models[modelId].metrics
            })
        end
    end
    
    -- Record the interaction
    State.UserInteractions[modelId][interactionKey] = os.time()
    
    -- Update the metric
    State.Models[modelId].metrics[metricType] = 
        (State.Models[modelId].metrics[metricType] or 0) + 1
        
    return json.encode({
        status = "success",
        message = metricType .. " updated successfully",
        metrics = State.Models[modelId].metrics
    })
end)

-- Add a handler to check user interactions
Handle("GetUserInteractions", function(msg)
    local modelId = msg.Tags.modelId
    local userAddress = msg.Tags.userAddress
    
    if not State.Models[modelId] then
        return json.encode({
            status = "error",
            message = "Model not found"
        })
    end
    
    local interactions = {
        likes = false,
        forks = false
    }
    
    if State.UserInteractions[modelId] then
        interactions.likes = State.UserInteractions[modelId][getUserInteractionKey(modelId, userAddress, "likes")] ~= nil
        interactions.forks = State.UserInteractions[modelId][getUserInteractionKey(modelId, userAddress, "forks")] ~= nil
    end
    
    return json.encode({
        status = "success",
        interactions = interactions
    })
end)