# AI Registry - Decentralized AI Model & Dataset Platform

![AI Registry Platform](/public/screenshot1.png)
_Screenshot placeholder: Show the main platform interface with model listings_

## Overview

AI Registry is a decentralized platform for hosting, discovering, and sharing AI models and datasets, built on Arweave's permanent storage and AO's decentralized computation infrastructure. The platform enables researchers, developers, and organizations to:

- 🤖 Share and discover AI models
- 📊 Access curated datasets
- 🎮 Test models in an interactive playground

![Model Details](/public/screenshot2.png)
_Display a detailed view of a model page_

## Features

### Model Registry

- 🔒 Permanent, immutable storage powered by Arweave
- 📦 Model source code hosted on protocol.land with version control
- 📝 Rich model documentation with metadata, examples, and benchmarks
- 🔄 Complete version history and model lineage tracking
- 🏷️ Customizable tagging and categorization

### Dataset Management

![Datasets Page](/public/screenshot3.png)
_Screenshot placeholder: Show the datasets listing page_

- Curated AI training datasets
- Integration with ArDrive for storage
- Dataset size and format information
- Usage tracking and analytics
- License management

### AI Playground

![AI Playground](/public/screenshot4.png)
_Screenshot placeholder: Demonstrate the AI playground interface_

- Test models directly in browser
- Support for multiple AI providers:
  - OpenAI (ChatGPT)
  - Google (Gemini)
  - Custom model inference
- Interactive UI for model testing

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Storage**: Arweave, ArDrive
- **Computation**: AO (Arweave Computation)
- **Authentication**: Arweave Wallet Kit
- **Styling**: Tailwind CSS, Shadcn UI

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- Arweave Wallet (e.g., ArConnect)
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

The platform uses AO smart contracts for:

- Model registration and updates
- Download tracking
- User interactions (likes, forks)
- Dataset management

### Key Contract Functions

```lua
-- Example AO contract interaction
Handle("RegisterModel", function(msg)
    local name = msg.Tags.name
    State.Models[name] = {
        name = name,
        owner = msg.From,
        description = msg.Tags.description,
        // ... additional fields
    }
end)
```

## Deployment

The application can be deployed to the Permaweb through Protocol Land:

1. Build the application:

```bash
npm run build
```

2. Upload to Protocol Land
3. Deploy using Dragon Deploy
4. (Optional) Set up ArNS domain

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📚 [Documentation](https://docs.airegistry.arweave.net)
- 💬 [Discord Community](https://discord.gg/airegistry)
- 🐦 [Twitter](https://twitter.com/airegistry)

## Acknowledgments

- Arweave Team
- Community Labs
- All contributors and community members

---

Built with ❤️ on Arweave
