import { FONTS_FAMILIES } from '@renderer/constants'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import useAppStore from '@renderer/store/store'
import { Select, Upload, UploadProps, message } from 'antd'
import FontFamilyItem from './FontFamilyItem'
import { UploadOutlined } from '@ant-design/icons'

const supportedFormats = ['font/ttf', 'font/otf', 'font/woff', 'font/woff2']
const uploadOptionValue = 'upload-c019dbe7cd8c8'

export default function FontFamily(): JSX.Element {
  const subtitleStyleProps = useProjectStore((state) => state.subtitleStyleProps)
  const setSubtitleStyleProps = useAppStore((state) => state.setSubtitleStyleProps)
  const userFonts = useAppStore((state) => state.userFonts)
  const addUserFont = useAppStore((state) => state.addUserFont)

  const props: UploadProps = {
    accept: supportedFormats.map((f) => '.' + f.split('/')[1]).join(', '),
    customRequest: async ({ file }) => {
      const typecastedFile = file as File
      if (!supportedFormats.includes(typecastedFile.type)) {
        message.error('File format is not supported.')
        return
      }
      const filename = typecastedFile.name
      const fontName = filename.substring(0, filename.lastIndexOf('.')) || filename
      if (FONTS_FAMILIES.includes(fontName) || userFonts.some((font) => font.name === fontName)) {
        message.error('Font with this name already exists. Try changing the file name.')
        return
      }
      const reader = new FileReader()
      reader.onload = async (): Promise<void> => {
        const path = await window.electron.ipcRenderer.invoke(
          'save-font-file',
          reader.result,
          filename
        )
        addUserFont({ name: fontName, path })
      }
      reader.readAsDataURL(typecastedFile)
    },
    showUploadList: false
  }

  return (
    <Select
      className="w-4/6 h-10"
      showSearch
      placeholder="Select a font"
      options={[
        {
          label: <span className="text-lg">Brand Kit</span>,
          options: [
            {
              label: (
                <Upload {...props}>
                  <div className="w-[2000px]">
                    <UploadOutlined className="mr-2" />
                    <span>Upload a font</span>
                  </div>
                </Upload>
              ),
              value: uploadOptionValue
            },
            ...userFonts.map((font) => ({
              value: font.name,
              label: font.name,
              path: font.path
            }))
          ]
        },
        {
          label: <span className="text-lg">Popular</span>,
          options: FONTS_FAMILIES.map((font) => ({
            value: font,
            label: font
          }))
        }
      ]}
      value={subtitleStyleProps?.fontFamily}
      style={{ fontFamily: subtitleStyleProps?.fontFamily }}
      onChange={(value) => {
        if (value === uploadOptionValue) return
        setSubtitleStyleProps({
          ...subtitleStyleProps,
          fontFamily: value
        })
      }}
      optionRender={({ value, label, data: { path } }) => {
        if (value === uploadOptionValue) return label
        return <FontFamilyItem name={value as string} path={path} />
      }}
    />
  )
}
