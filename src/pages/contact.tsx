import { Github, Linkedin, Mail, Code } from 'lucide-react';

const ContactPage = () => {
  const developerInfo = {
    name: "Naitik Srivastava",
    title: "Full Stack Developer",
    email: "naitiksrivastava.dev@gmail.com",
    photo: "/pic.jpeg",
    linkedin: "https://linkedin.com/in/naitik-srivastava0",
    github: "https://github.com/Naitik1886"
  };

  return (
    <div className="min-h-[670px] bg-background  text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Meet the Developer
          </h1>
          <div className="w-16 h-0.5 bg-primary mx-auto rounded-full"></div>
        </div>

        {/* Main Content */}
        <div className="bg-card rounded-2xl p-6 md:p-8 border shadow-lg">
          <div className="flex flex-col items-center text-center space-y-6">
            
            {/* Photo and Basic Info */}
            <div className="space-y-4">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full overflow-hidden ring-2 ring-primary/20 shadow-lg">
                  <img 
                    src={developerInfo.photo} 
                    alt={developerInfo.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-2 shadow-lg">
                  <Code className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{developerInfo.name}</h2>
                <p className="text-lg text-muted-foreground">{developerInfo.title}</p>
              </div>
            </div>

            {/* Contact Links */}
            <div className="w-full max-w-sm space-y-3">
              <a 
                href={`mailto:${developerInfo.email}`}
                className="flex items-center space-x-3 p-3 bg-secondary rounded-lg border hover:bg-secondary/80 transition-all duration-300 hover:translate-y-[-1px] hover:shadow-md group w-full"
              >
                <div className="bg-blue-500 p-2 rounded-md group-hover:scale-110 transition-transform">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Email Me</p>
                  <p className="text-muted-foreground text-xs">{developerInfo.email}</p>
                </div>
              </a>

              <a 
                href={developerInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 bg-secondary rounded-lg border hover:bg-secondary/80 transition-all duration-300 hover:translate-y-[-1px] hover:shadow-md group w-full"
              >
                <div className="bg-blue-600 p-2 rounded-md group-hover:scale-110 transition-transform">
                  <Linkedin className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">LinkedIn</p>
                  <p className="text-muted-foreground text-xs">Connect professionally</p>
                </div>
              </a>

              <a 
                href={developerInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 bg-secondary rounded-lg border hover:bg-secondary/80 transition-all duration-300 hover:translate-y-[-1px] hover:shadow-md group w-full"
              >
                <div className="bg-gray-700 dark:bg-gray-600 p-2 rounded-md group-hover:scale-110 transition-transform">
                  <Github className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">GitHub</p>
                  <p className="text-muted-foreground text-xs">Check out my projects</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;