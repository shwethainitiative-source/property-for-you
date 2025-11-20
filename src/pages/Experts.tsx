import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Experts = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Experts</h1>
          <p className="text-muted-foreground">
            Connect with verified property experts
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Experts;
