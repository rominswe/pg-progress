import { useState, useEffect, useCallback } from "react";
import { Check, ChevronsUpDown, Loader2, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import api from "@/services/api";

/**
 * UniversitySearch Component
 * A debounced searchable combobox for university names and domains using Hipo Labs API.
 */
export default function UniversitySearch({ value, onSelect, className }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Debounced search logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search.length >= 2) {
                fetchUniversities(search);
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const fetchUniversities = async (query) => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/universities/search?q=${encodeURIComponent(query)}`);
            if (res.data?.success) {
                setResults(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching universities:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between font-normal text-slate-700 bg-white border-slate-200 hover:bg-slate-50/50 h-10", className, !value && "text-slate-400")}
                >
                    <span className="truncate">
                        {value ? value : "Select or search university..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white shadow-xl border" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Type university name..."
                        onValueChange={setSearch}
                        className="h-9"
                    />
                    <CommandList>
                        {loading && (
                            <div className="py-6 flex flex-col items-center gap-2 text-slate-400">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-[10px] font-medium tracking-tight">Searching Hipo Database...</span>
                            </div>
                        )}

                        {!loading && search.length >= 2 && results.length === 0 && (
                            <CommandEmpty className="py-6 flex flex-col items-center gap-2">
                                <p className="text-sm text-slate-500">No results found.</p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-primary hover:text-primary/80 font-bold"
                                    onClick={() => {
                                        onSelect(search, null);
                                        setOpen(false);
                                    }}
                                >
                                    Use "{search}" as Custom Entry
                                </Button>
                            </CommandEmpty>
                        )}

                        <CommandGroup heading="Results">
                            {results.map((univ, idx) => (
                                <CommandItem
                                    key={idx}
                                    value={univ.name}
                                    onSelect={() => {
                                        onSelect(univ.name, univ.domains?.[0] || null);
                                        setOpen(false);
                                    }}
                                    className="flex flex-col items-start gap-1 py-3 px-4"
                                >
                                    <div className="flex items-center gap-2 w-full">
                                        <Landmark className="h-3 w-3 text-slate-400" />
                                        <span className="font-semibold text-sm truncate">{univ.name}</span>
                                        {value === univ.name && <Check className="ml-auto h-4 w-4 text-primary" />}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-5">
                                        <span>{univ.country}</span>
                                        {univ.domains?.[0] && (
                                            <>
                                                <span className="text-slate-200">|</span>
                                                <span className="text-primary/70">{univ.domains[0]}</span>
                                            </>
                                        )}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>

                        {search.length > 0 && (
                            <CommandGroup heading="Actions">
                                <CommandItem
                                    className="text-primary font-bold text-xs"
                                    onSelect={() => {
                                        onSelect(search, null);
                                        setOpen(false);
                                    }}
                                >
                                    Use "{search}" (Custom Entry)
                                </CommandItem>
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
