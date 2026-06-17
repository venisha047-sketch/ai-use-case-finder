"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateProjectSchema, type CreateProjectInput } from "@/lib/validations";
import { INDUSTRIES, DEPARTMENTS, COMPANY_SIZE_LABELS } from "@/lib/utils";
import type { CompanySize } from "@/types";
import { Loader2 } from "lucide-react";

interface ProjectFormProps {
  defaultValues?: Partial<CreateProjectInput>;
  onSubmit: (data: CreateProjectInput) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ProjectForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Create Project",
}: ProjectFormProps) {
  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: {
      title: "",
      industry: "",
      department: "",
      companySize: undefined,
      problemStatement: "",
      processDescription: "",
      ...defaultValues,
    },
  });

  const problemLen = form.watch("problemStatement")?.length ?? 0;
  const processLen = form.watch("processDescription")?.length ?? 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Project title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Customer Support Automation Analysis"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Industry */}
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Department */}
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DEPARTMENTS.map((dep) => (
                      <SelectItem key={dep} value={dep}>
                        {dep}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Company size */}
        <FormField
          control={form.control}
          name="companySize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Size</FormLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  Object.entries(COMPANY_SIZE_LABELS) as [CompanySize, string][]
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(value)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                      field.value === value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Problem statement */}
        <FormField
          control={form.control}
          name="problemStatement"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Problem Statement</FormLabel>
                <span
                  className={`text-xs ${problemLen > 1800 ? "text-amber-600" : "text-muted-foreground"}`}
                >
                  {problemLen}/2000
                </span>
              </div>
              <FormControl>
                <Textarea
                  placeholder="Describe the specific business challenge or inefficiency you want to address with AI. Include current pain points, bottlenecks, and measurable costs if known."
                  className="min-h-28 resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Minimum 20 characters. More detail yields better recommendations.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Process description */}
        <FormField
          control={form.control}
          name="processDescription"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Current Process Description</FormLabel>
                <span
                  className={`text-xs ${processLen > 2700 ? "text-amber-600" : "text-muted-foreground"}`}
                >
                  {processLen}/3000
                </span>
              </div>
              <FormControl>
                <Textarea
                  placeholder="Describe how this process works today — the steps involved, who does them, what tools are used, how long it takes, and where the most friction occurs."
                  className="min-h-32 resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Minimum 20 characters. Include data sources, team sizes, and
                tools in use.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isLoading} className="min-w-32">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
