import { deleteProjectById, duplicateProjectById, editProjectById, getAllPlaygroundForUser } from "@/modules/dashboard/actions";
import AddNewButton from "@/modules/dashboard/components/add-new";
import AddRepo from "@/modules/dashboard/components/add-repo";
import EmptyState from "@/modules/dashboard/components/empty-state";
import ProjectTable from "@/modules/dashboard/components/project-table";
import React from "react";

const page = async () => {
  const playground = await getAllPlaygroundForUser();
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-start px-5 py-8 lg:px-8 lg:py-12">
      <div className="mb-8 w-full">
        <p className="eyebrow">Workspace</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 dark:text-white">Your projects</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Create, manage, and ship your next idea.</p>
      </div>
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        <AddNewButton />
        <AddRepo />
      </div>
      <div className="mt-10 flex flex-col justify-center items-center w-full">
        {playground && playground.length === 0 ? (
          <EmptyState />
        ) : (
          <ProjectTable
            projects={playground || []}
            onDeleteProject={deleteProjectById}
            onUpdateProject={editProjectById}
            onDuplicateProject={duplicateProjectById}
          />
        )}
      </div>
    </div>
  );
};

export default page;
