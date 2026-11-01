const steps = [
  {
    title: "Add a book",
    description:
      "Librarians and readers add books to the catalogue with cover, description and copy count.",
  },
  {
    title: "Borrow",
    description:
      "Borrow a book in seconds and give it a second life on the shelf of a fellow reader.",
  },
  {
    title: "Return",
    description:
      "When you are done, return it so someone else can pick it up. No queues, no late fees.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-ice">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl font-semibold text-navy sm:text-4xl">
          How BookNook works
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-2xl bg-white p-8 shadow-sm">
              <p className="font-serif text-5xl font-semibold text-royal">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-4 font-serif text-2xl font-semibold text-ink">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
