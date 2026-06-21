import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workspaceRoot = path.resolve(__dirname, '..');
const aboutMePath = path.join(workspaceRoot, 'about-me');
const projectsPath = path.join(workspaceRoot, 'projects');
const frontendOutputPath = path.join(workspaceRoot, 'front-web/src/data/portfolioData.js');
const backendOutputPath = path.join(workspaceRoot, 'backend-api/data/portfolioData.js');
const publicProjectsPath = path.join(workspaceRoot, 'front-web/public/projects');
const publicAboutPath = path.join(workspaceRoot, 'front-web/public/about');

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  entries.forEach(entry => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    } else if (entry.isSymbolicLink()) {
      const linkTarget = fs.readlinkSync(srcPath);
      fs.symlinkSync(linkTarget, destPath);
    }
  });
}

function compile() {
  console.log('Compiling portfolio data...');

  // Copy project assets into the frontend public directory if it doesn't already exist
  if (!fs.existsSync(publicProjectsPath)) {
    try {
      copyDirectory(projectsPath, publicProjectsPath);
      console.log('Copied projects directory to front-web/public/projects');
    } catch (err) {
      console.warn('Could not copy projects directory:', err.message);
    }
  }

  // Copy about me files into the frontend public directory if it doesn't already exist
  if (!fs.existsSync(publicAboutPath)) {
    try {
      copyDirectory(aboutMePath, publicAboutPath);
      console.log('Copied about directory to front-web/public/about');
    } catch (err) {
      console.warn('Could not copy about directory:', err.message);
    }
  }
  
  // 1. Read about me files
  const aboutMe = {
    images: []
  };
  if (fs.existsSync(aboutMePath)) {
    const files = fs.readdirSync(aboutMePath);
    files.forEach(file => {
      const filePath = path.join(aboutMePath, file);
      if (fs.statSync(filePath).isFile()) {
        const ext = path.extname(file);
        if (ext === '.md') {
          const name = path.basename(file, ext).toLowerCase();
          aboutMe[name] = fs.readFileSync(filePath, 'utf8');
        }
      }
    });

    const aboutAssetsPath = path.join(aboutMePath, 'assets');
    if (fs.existsSync(aboutAssetsPath)) {
      const assetFiles = fs.readdirSync(aboutAssetsPath).filter(file => /\.(jpeg|jpg|png|gif|svg|webp)$/i.test(file));
      aboutMe.images = assetFiles.map(file => `/about/assets/${file}`);
    }
  }

  // 2. Read projects
  const projects = [];
  if (fs.existsSync(projectsPath)) {
    const projectDirs = fs.readdirSync(projectsPath);
    projectDirs.forEach(dir => {
      const dirPath = path.join(projectsPath, dir);
      if (fs.statSync(dirPath).isDirectory()) {
        const readmePath = path.join(dirPath, 'README.md');
        const assetsPath = path.join(dirPath, 'assets');
        
        let readme = '';
        if (fs.existsSync(readmePath)) {
          readme = fs.readFileSync(readmePath, 'utf8');
        }

        const images = [];
        if (fs.existsSync(assetsPath)) {
          try {
            const files = fs.readdirSync(assetsPath);
            files.forEach(file => {
              if (/\.(jpeg|jpg|png|gif|svg|webp)$/i.test(file)) {
                // Return relative path from front-web public directory or imports
                // We'll copy or reference them. Since they are in the projects folder,
                // we can symlink or copy the projects folder to front-web/public/projects,
                // or compile references that the frontend can fetch.
                // Let's resolve the path relative to the front-web/public directory!
                images.push(`/projects/${dir}/assets/${file}`);
              }
            });
          } catch (err) {
            console.error(`Error reading assets for ${dir}:`, err);
          }
        }

        // Try to parse basic metadata from readme
        const title = dir;
        let summary = '';
        let tags = [];
        let repository = '';
        let website = '';
        
        if (readme) {
          // Extract first paragraph as summary (strip markdown bold/links)
          const paragraphs = readme.split('\n\n').map(p => p.trim()).filter(Boolean);
          const firstParagraph = paragraphs.find(p => !p.startsWith('#') && !p.startsWith('**') && !p.startsWith('!'));
          if (firstParagraph) {
            summary = firstParagraph.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').slice(0, 180) + '...';
          } else {
            summary = `Project details for ${dir}.`;
          }

          // Extract Technology Stack from README
          const techSectionMatch = readme.match(/### Technology Stack([\s\S]*?)(###|$)/) ||
                                   readme.match(/### Tech Stack([\s\S]*?)(###|$)/);
          if (techSectionMatch) {
            const listItems = techSectionMatch[1].match(/\*\s+\*\*([^*]+)\*\*/g) || 
                              techSectionMatch[1].match(/\*([^*]+)/g);
            if (listItems) {
              tags = listItems.map(item => item.replace(/\*\s+\*\*/g, '').replace(/\*\*/g, '').replace(/\*/g, '').trim());
            }
          }

          // Extract project links from README
          const linksSectionMatch = readme.match(/###\s*Links:\s*([\s\S]*?)(?:\n###|$)/i);
          if (linksSectionMatch) {
            const linksSection = linksSectionMatch[1];
            const linkLines = linksSection.split('\n').map(line => line.trim().replace(/^\*+\s*/, '').replace(/\*\*/g, ''));
            linkLines.forEach(line => {
              const repoMatch = line.match(/^Repositories?\s*:\s*(https?:\/\/\S+)/i);
              const websiteMatch = line.match(/^Website\s*:\s*(https?:\/\/\S+)/i);
              if (repoMatch) repository = repoMatch[1].trim();
              if (websiteMatch) website = websiteMatch[1].trim();
            });
          }
        }

        projects.push({
          id: dir.replace(/\s+/g, '-').toLowerCase(),
          title,
          summary,
          tags: tags.length ? tags : ['Software Dev'],
          repository,
          website,
          readme,
          images,
          folderName: dir
        });
      }
    });
  }

  // Generate output file
  const fileContent = `// Compiled Portfolio Data (Auto-Generated)
export const aboutMe = ${JSON.stringify(aboutMe, null, 2)};

export const projects = ${JSON.stringify(projects, null, 2)};
`;

  // For frontend
  const frontendOutputDir = path.dirname(frontendOutputPath);
  if (!fs.existsSync(frontendOutputDir)) {
    fs.mkdirSync(frontendOutputDir, { recursive: true });
  }
  fs.writeFileSync(frontendOutputPath, fileContent, 'utf8');
  console.log(`Portfolio data compiled successfully to ${frontendOutputPath}!`);

  // For backend
  const backendOutputDir = path.dirname(backendOutputPath);
  if (!fs.existsSync(backendOutputDir)) {
    fs.mkdirSync(backendOutputDir, { recursive: true });
  }
  fs.writeFileSync(backendOutputPath, fileContent, 'utf8');
  console.log(`Portfolio data compiled successfully to ${backendOutputPath}!`);
}

compile();
