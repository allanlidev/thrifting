import { ActivityIndicator, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { useRouter } from 'expo-router'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { Input } from '~/src/components/ui/input'
import { Label } from '~/src/components/ui/label'
import { Textarea } from '~/src/components/ui/textarea'
import { Tables } from '~/src/database.types'
import { useCategories } from '~/src/hooks/queries/listings'
import { Muted } from '~/src/components/ui/typography'
import { Frown } from '~/src/components/icons/Frown'
import {
  Option,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/src/components/ui/select'
import { Button } from '~/src/components/ui/button'
import { Text } from '~/src/components/ui/text'
import { supabase } from '~/src/lib/supabase'
import { ErrorMessage } from '~/src/components/ErrorMessage'

const isOption = (val: unknown): val is NonNullable<Option> => {
  return (
    typeof val === 'object' &&
    val !== null &&
    'value' in val &&
    'label' in val &&
    typeof (val as any).value === 'string' &&
    typeof (val as any).label === 'string'
  )
}

export function ListingForm({ listing }: { listing: Tables<'products'> }) {
  const { data: categories, isFetching: isCategoriesFetching } = useCategories()
  const router = useRouter()
  const queryClient = useQueryClient()

  const updateSchema = z.object({
    title: z.string().min(1, t`Title is required`),
    description: z.string().min(1, t`Description is required`),
    price: z
      .string()
      .refine((val) => !isNaN(parseInt(val)), { message: t`Must be a valid number` })
      .refine((val) => parseInt(val) > 0, { message: t`Minimum price 1` })
      .refine((val) => parseInt(val) <= 999_999, { message: t`Maximum price 999 999` }),
    category: z.custom<NonNullable<Option>>(isOption, {
      message: t`Category is required`,
    }),
  })

  const form = useForm({
    defaultValues: {
      title: listing.title ?? '',
      description: listing.description ?? '',
      price: listing.price ? String(listing.price) : '0',
      category: listing.category_id
        ? {
            value: String(
              categories?.find((category) => listing.category_id === category.id)?.id ?? ''
            ),
            label: categories?.find((category) => listing.category_id === category.id)?.title ?? '',
          }
        : null,
    },
    validators: { onChange: updateSchema },
    onSubmitMeta: { publish: false },
    onSubmit: async ({ value, meta }) => {
      const { category, price, ...rest } = value

      const { error } = await supabase
        .from('products')
        .update({
          ...rest,
          category_id: value.category?.value ? parseInt(value.category.value) : null,
          price: parseInt(value.price),
          published: meta.publish,
        })
        .eq('id', listing.id)
        .select()

      if (error) {
        Toast.show({
          type: 'error',
          text1: t`Error updating listing`,
          text2: error.message,
        })
        return
      }

      Toast.show({
        type: 'success',
        text1: meta.publish ? t`Successfully published listing` : t`Successfully saved listing`,
      })
      queryClient.invalidateQueries({ queryKey: ['listings', 'drafts'] })
      router.dismiss()
    },
  })

  const insets = useSafeAreaInsets()
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
  }

  return (
    <>
      {categories && !isCategoriesFetching ? (
        <View className="flex-1 gap-6 p-6">
          <View className="gap-2">
            <Label nativeID="categoryLabel">
              <Trans>Category</Trans>
            </Label>
            <form.Field
              name="category"
              children={(field) => (
                <>
                  <Select
                    aria-labelledby="categoryLabel"
                    value={field.state.value ?? undefined}
                    onValueChange={(option) => {
                      field.handleChange(option ?? null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder=""
                        className="native:text-lg text-sm text-foreground"
                      />
                    </SelectTrigger>
                    <SelectContent insets={contentInsets}>
                      <SelectGroup>
                        {categories
                          .filter((category) => category.title != null)
                          .map((category) => (
                            <SelectItem
                              key={category.id}
                              label={category.title!}
                              value={String(category.id)}
                            >
                              {category.title}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors.length > 0 && (
                    <ErrorMessage
                      msg={field.state.meta.errors.map((error) => error?.message).join(', ')}
                    />
                  )}
                </>
              )}
            />
          </View>
          <View className="gap-2">
            <Label nativeID="titleLabel">
              <Trans>Title</Trans>
            </Label>
            <form.Field
              name="title"
              children={(field) => (
                <>
                  <Input
                    value={field.state.value}
                    onChangeText={(text) => field.handleChange(text)}
                    aria-labelledby="titleLabel"
                    aria-errormessage="titleError"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <ErrorMessage
                      msg={field.state.meta.errors.map((error) => error?.message).join(', ')}
                    />
                  )}
                </>
              )}
            />
          </View>
          <View className="gap-2">
            <Label nativeID="descriptionLabel">
              <Trans>Description</Trans>
            </Label>
            <form.Field
              name="description"
              children={(field) => (
                <>
                  <Textarea
                    value={field.state.value}
                    onChangeText={(text) => field.handleChange(text)}
                    aria-labelledby="descriptionLabel"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <ErrorMessage
                      msg={field.state.meta.errors.map((error) => error?.message).join(', ')}
                    />
                  )}
                </>
              )}
            />
          </View>
          <View className="gap-2">
            <Label nativeID="priceLabel">
              <Trans>Price</Trans>
            </Label>
            <form.Field
              name="price"
              children={(field) => (
                <>
                  <Input
                    keyboardType="number-pad"
                    value={
                      !isNaN(parseInt(field.state.value))
                        ? String(parseInt(field.state.value))
                        : field.state.value
                    }
                    onChangeText={(text) => field.handleChange(text)}
                    aria-labelledby="priceLabel"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <ErrorMessage
                      msg={field.state.meta.errors.map((error) => error?.message).join(', ')}
                    />
                  )}
                </>
              )}
            />
          </View>
          <Button
            disabled={form.state.isSubmitting || !form.state.canSubmit || !form.state.isDirty}
            onPress={() => form.handleSubmit({ publish: true })}
          >
            {form.state.isSubmitting ? (
              <ActivityIndicator />
            ) : (
              <Text>
                <Trans>Save and publish</Trans>
              </Text>
            )}
          </Button>
          <Button
            variant="secondary"
            disabled={form.state.isSubmitting || !form.state.canSubmit || !form.state.isDirty}
            onPress={() => form.handleSubmit({ publish: false })}
          >
            {form.state.isSubmitting ? (
              <ActivityIndicator />
            ) : (
              <Text>
                <Trans>Save as draft</Trans>
              </Text>
            )}
          </Button>
        </View>
      ) : (
        <View className="flex-1 justify-center gap-4">
          {isCategoriesFetching ? (
            <ActivityIndicator />
          ) : (
            <>
              <Frown className="mx-auto size-12 color-muted-foreground" />
              <Muted className="mx-auto">
                <Trans>Could not find categories</Trans>
              </Muted>
            </>
          )}
        </View>
      )}
    </>
  )
}
