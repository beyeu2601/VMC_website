import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

export const RichText = ({ data }: { data?: SerializedEditorState | null }) => {
  if (!data) return null

  return <LexicalRichText data={data} />
}
