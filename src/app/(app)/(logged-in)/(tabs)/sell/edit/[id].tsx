import { useState } from 'react'
import { KeyboardAvoidingView, ScrollView, View } from 'react-native'
import { Input } from '~/src/components/ui/input'
import { Label } from '~/src/components/ui/label'
import { Textarea } from '~/src/components/ui/textarea'

export default function EditListing() {
  const [value, setValue] = useState('')

  const onChangeText = (text: string) => {
    setValue(text)
  }

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <ScrollView contentContainerClassName=" flex-1 gap-6 p-6">
        <View className="gap-2">
          <Label nativeID="titleLabel">Title</Label>
          <Input
            value={value}
            onChangeText={onChangeText}
            aria-labelledby="titleLabel"
            aria-errormessage="titleError"
          />
        </View>
        <View className="gap-2">
          <Label nativeID="descriptionLabel">Description</Label>
          <Textarea value={value} onChangeText={setValue} aria-labelledby="descriptionLabel" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
