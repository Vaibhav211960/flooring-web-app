// import { LucideIcon } from "lucide-react"; // optional import (not required for JS)

function FeatureBox({ icon: Icon, title, description }) {
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border hover:shadow-md transition-all duration-300 flex flex-col items-center text-center group">
      <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-serif text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export { FeatureBox };
