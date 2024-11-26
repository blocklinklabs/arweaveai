# AI Registry - Decentralized AI Model & Dataset Platform

![AI Registry Platform](/public/screenshots/screenshot1.png)
_Main dashboard showing model categories, search, and featured AI models_

## Overview

Arweave AI Registry is a decentralized platform for hosting, discovering, and sharing AI models and datasets, built on Arweave's permanent storage and AO's decentralized computation infrastructure. The platform enables:

- 🤖 Permanent, decentralized AI model hosting
- 📊 Curated dataset management through ArDrive
- 🤝 Community-driven model ratings and reviews
- 🎮 Interactive model testing playground
- 🤖 AI-powered chat agents for documentation

## Features

### Model Registry

![Model Listing](/public/screenshots/screenshot1.2.png)
_Model listing page showing categorized AI models with metrics_

- **Categories**
  - Multimodal (Audio-Text, Image-Text, VQA)
  - Computer Vision (Classification, Detection, Segmentation)
  - Natural Language Processing (Generation, Translation)
- **Model Features**
  - 🔒 Permanent storage on Arweave
  - 📦 Version control via Protocol.land integration
  - 📊 Usage metrics (downloads, likes, forks)
  - 🏷️ Rich tagging and categorization
  - 💬 Community discussions and reviews

### Dataset Management

![Dataset Explorer](/public/screenshots/screenshot3.png)
_Dataset explorer showing available training datasets_

- **Storage Options**
  - Permanent storage via Arweave
  - Temporary storage via ArFleet
  - Direct ArDrive integration
- **Dataset Features**
  - 📊 Size and format information
  - 📈 Usage analytics
  - 🔑 License management
  - 🔄 Version tracking
  - 🔍 Advanced search and filtering

### AI Playground

![Playground Interface](/public/screenshots/screenshot4.png)
_Interactive playground for testing AI models_

- **Supported Providers**
  - OpenAI (GPT-3.5, GPT-4)
  - Google (Gemini)
  - Custom model inference
- **Features**
  - Real-time model testing
  - Parameter adjustment
  - Response visualization
  - Performance metrics
  - API key management

### AI Agents

![AI Agents](/public/screenshots/screenshot5.png)
![AI Agents](/public/screenshots/screenshot6.png)
_AI agents page showing documentation assistants_

- **Agent Types**
  - Documentation assistants
  - Support agents
  - Research assistants
- **Features**
  - Custom knowledge base training
  - Real-time chat interface
  - Integration with existing documentation
  - Usage analytics

## Technology Stack

- **Frontend**:

  - Next.js 14
  - React
  - TypeScript
  - Tailwind CSS
  - Shadcn UI

- **Blockchain & Storage**:

  - Arweave (permanent storage)
  - ArDrive (dataset management)
  - AO (smart contracts)
  - ArFleet (temporary storage)

- **Authentication**:
  - Arweave Wallet Kit
  - ArConnect integration

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- Arweave Wallet (ArConnect)
- AR tokens for transactions

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ai-registry.git
cd ai-registry
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file:

```env
NEXT_PUBLIC_AO_PROCESS=your_ao_process_id
```

4. Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Smart Contract Integration

The platform uses AO smart contracts for model and agent management. Key features include:

```lua
-- Example model registration
Handle("RegisterModel", function(msg)
    local name = msg.Tags.name
    State.Models[name] = {
        name = name,
        owner = msg.From,
        description = msg.Tags.description,
        modelType = msg.Tags.modelType,
        category = msg.Tags.category,
        metrics = {
            downloads = 0,
            likes = 0,
            forks = 0
        }
    }
    return json.encode({ status = "success" })
end)
```

## Deployment

### Building for Production

1. Build the application:

```bash
npm run build
```

2. Deploy to Protocol Land:
   - Upload build folder contents
   - Use Dragon Deploy for deployment
   - Set up ArNS domain (optional)

### ArNS Setup

1. Obtain $tIO tokens from AR.IO Discord
2. Visit arns.app to register domain
3. Configure DNS settings
4. Link deployment transaction

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Arweave Team
- Community Labs
- Protocol Land Team
- All contributors and community members

---

Built with ❤️ on Arweave
