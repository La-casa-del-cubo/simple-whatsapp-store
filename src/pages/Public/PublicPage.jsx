import { useEffect, useState, useContext } from "react"
import { useParams } from "react-router-dom"
import { SupabaseContext } from "../../contexts/SupabaseContext"
import DOMPurify from "dompurify"
import DynamicCubeTitle from "../../components/DynamicCubeTitle.jsx";
import {Helmet} from "react-helmet";

export default function PublicPage() {
    const { slug } = useParams()
    const supabase = useContext(SupabaseContext)
    const [page, setPage] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchPage() {
            setLoading(true)
            const { data, error } = await supabase
                .from("page_configuration")
                .select("title, content")
                .eq("page_name", slug)
                .single()
            if (data) setPage(data)
            setLoading(false)
        }
        fetchPage()
    }, [slug, supabase])

    if (loading) return <p>Cargando...</p>
    if (!page) return <p>Página no encontrada.</p>

    return (
        <>
            <Helmet>
                <title>{page.title ? `${page.title} - La casa del cubo` : "La casa del cubo"}</title>
                <meta name="description" content={`Contenido de ${page.title}`} />
            </Helmet>

            <article className="prose max-w-none mx-auto p-6">
                <DynamicCubeTitle title={page.title} isDynamic={true} />
                <div
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content) }}
                />
            </article>
        </>
    )
}
