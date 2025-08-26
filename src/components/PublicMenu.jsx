import { useEffect, useState, useContext } from "react"
import { Link } from "react-router-dom"
import { SupabaseContext } from "../contexts/SupabaseContext"

export default function PublicMenu() {
    const supabase = useContext(SupabaseContext)
    const [pages, setPages] = useState([])

    useEffect(() => {
        async function fetchMenuPages() {
            const { data } = await supabase
                .from("page_configuration")
                .select("page_name, title")
                .eq("show_in_menu", true)
                .order("title", { ascending: true })
            if (data) setPages(data)
        }
        fetchMenuPages()
    }, [supabase])

    return (
        <nav className="flex space-x-3">
            {pages.map((page) => (
                <Link
                    to={`/pages/${page.page_name}`}
                    key={page.page_name}
                    className="flex items-center px-5 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-yellow-400 via-red-500 to-blue-500 shadow-md hover:scale-105 hover:shadow-lg transition"
                    aria-label={`Ir a la página ${page.title}`}
                >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><rect width="20" height="20" rx="3" fill="white" stroke="#444" /><rect x="7" y="0" width="6" height="20" fill="#3478f7"/><rect y="7" width="20" height="6" fill="#34d058"/></svg>
                    {page.title}
                </Link>
            ))}
        </nav>
    )
}
