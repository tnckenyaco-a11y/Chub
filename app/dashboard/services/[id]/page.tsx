import { forbidden, notFound } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import {
  addPackage,
  addServiceImage,
  deletePackage,
  deleteService,
  deleteServiceImage,
  updateService,
} from "@/app/dashboard/services/actions";
import { AutoSubmitFileInput } from "@/components/auto-submit-file-input";

export default async function EditServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const profile = await requireProfile();
  if (profile.role !== "creative") forbidden();

  const { id } = await params;
  const { saved } = await searchParams;
  const supabase = await createClient();

  const [{ data: service }, { data: categories }, { data: packages }, { data: images }] =
    await Promise.all([
      supabase
        .from("services")
        .select("id, title, description, category_id, status, creative_id")
        .eq("id", id)
        .maybeSingle(),
      supabase.from("categories").select("id, name").order("sort_order"),
      supabase
        .from("service_packages")
        .select("id, title, price_kes, delivery_days, revisions")
        .eq("service_id", id)
        .order("sort_order"),
      supabase
        .from("service_images")
        .select("id, file_url")
        .eq("service_id", id)
        .order("sort_order"),
    ]);

  if (!service || service.creative_id !== profile.id) notFound();

  const update = updateService.bind(null, id);
  const remove = deleteService.bind(null, id);
  const addPkg = addPackage.bind(null, id);
  const addImage = addServiceImage.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl uppercase text-ink">Edit Service</h1>
        <span className="text-xs uppercase text-ink/50">{service.status.replace("_", " ")}</span>
      </div>

      {saved && (
        <p className="mt-6 rounded-lg border border-volt/40 bg-volt/10 px-4 py-3 text-sm text-volt">
          Saved. Changes to a published service go back through review.
        </p>
      )}

      <form action={update} className="mt-8 max-w-2xl space-y-5">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Title
          </span>
          <input
            name="title"
            defaultValue={service.title}
            required
            className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-volt"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Description
          </span>
          <textarea
            name="description"
            defaultValue={service.description}
            rows={5}
            className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-3 text-ink outline-none focus:border-volt"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Category
          </span>
          <select
            name="category_id"
            defaultValue={service.category_id ?? ""}
            className="mt-1.5 w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-ink outline-none focus:border-volt"
          >
            <option value="">Select a category</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-full bg-volt px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink"
        >
          Save
        </button>
      </form>

      <section className="mt-14 max-w-2xl">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">Images</h2>
        <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4">
          {images?.map((img) => {
            const removeImg = deleteServiceImage.bind(null, id, img.id);
            return (
              <div key={img.id} className="overflow-hidden rounded-xl border border-line">
                <div
                  className="h-24 bg-cover bg-center"
                  style={{ backgroundImage: `url(${img.file_url})` }}
                />
                <form action={removeImg}>
                  <button
                    type="submit"
                    className="w-full py-1.5 text-xs text-ink/40 hover:text-magenta"
                  >
                    Remove
                  </button>
                </form>
              </div>
            );
          })}
        </div>
        <form action={addImage} className="mt-4">
          <AutoSubmitFileInput name="file" accept="image/png,image/jpeg,image/webp,image/gif" />
        </form>
        <p className="mt-2 text-xs text-ink/40">Add photos of your work. Max file size 10MB.</p>
      </section>

      <section className="mt-14">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">Packages</h2>
        <div className="mt-4 space-y-3">
          {packages?.map((p) => {
            const removePkg = deletePackage.bind(null, id, p.id);
            return (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-line px-4 py-3"
              >
                <div>
                  <p className="text-ink">{p.title}</p>
                  <p className="text-xs text-ink/50">
                    Ksh {p.price_kes.toLocaleString()} · {p.delivery_days}d delivery ·{" "}
                    {p.revisions} revisions
                  </p>
                </div>
                {packages.length > 1 && (
                  <form action={removePkg}>
                    <button
                      type="submit"
                      className="text-xs uppercase tracking-wide text-ink/40 hover:text-magenta"
                    >
                      Remove
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>

        <form action={addPkg} className="mt-6 grid gap-4 rounded-2xl border border-line p-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-ink/50">Package name</span>
            <input
              name="title"
              required
              className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-volt"
            />
          </label>
          <label className="block">
            <span className="text-xs text-ink/50">Price (KES)</span>
            <input
              name="price_kes"
              type="number"
              min={0}
              required
              className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-volt"
            />
          </label>
          <label className="block">
            <span className="text-xs text-ink/50">Delivery time (days)</span>
            <input
              name="delivery_days"
              type="number"
              min={1}
              required
              className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-volt"
            />
          </label>
          <label className="block">
            <span className="text-xs text-ink/50">Revisions</span>
            <input
              name="revisions"
              type="number"
              min={0}
              defaultValue={1}
              className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-volt"
            />
          </label>
          <button
            type="submit"
            className="col-span-full rounded-full border border-line px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink hover:border-volt"
          >
            Add Package
          </button>
        </form>
      </section>

      <form action={remove} className="mt-10">
        <button
          type="submit"
          className="rounded-full border border-magenta/40 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-magenta hover:border-magenta"
        >
          Delete Service
        </button>
      </form>
    </div>
  );
}
