import { useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native'
import { ScrollView as RNGHScrollView } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import Carousel, { type ICarouselInstance } from 'react-native-reanimated-carousel'
import { useSharedValue } from 'react-native-reanimated'
import { z } from 'zod'
import { Trans, useLingui } from '@lingui/react/macro'
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
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Images } from '~/src/components/icons/Images'
import { ImagePlus } from '~/src/components/icons/ImagePlus'
import { Camera } from '~/src/components/icons/Camera'
import { Trash } from '~/src/components/icons/Trash'
import { useColorScheme } from '~/src/hooks/useColorScheme'
import { RemoteImage } from '~/src/components/RemoteImage'
import { PaginationBasic } from '~/src/components/Pagination'
import { type Category, category as productCategory } from '~/src/lib/productCategory'

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
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false)

  const bottomSheetRef = useRef<BottomSheet>(null)
  const carouselRef = useRef<ICarouselInstance>(null)

  const { data: categories, isFetching: isCategoriesFetching } = useCategories()
  const router = useRouter()
  const queryClient = useQueryClient()
  const progress = useSharedValue<number>(0)
  const { width } = useWindowDimensions()
  const { isDarkColorScheme } = useColorScheme()
  const { t } = useLingui()

  /**
   * Handle pagination press to scroll to the corresponding index in the carousel.
   */
  const onPressPagination = (index: number) => {
    carouselRef.current?.scrollTo({
      /**
       * Calculate the difference between the current index and the target index
       * to ensure that the carousel scrolls to the nearest index
       */
      count: index - progress.value,
      animated: true,
    })
  }

  /**
   * Schema for updating a product listing.
   * Validates the title, description, price, category, and images.
   */
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
    images: z.array(z.string()).min(1, t`Image is required`),
  })
  type UpdateProduct = Omit<z.infer<typeof updateSchema>, 'category'> & {
    category: Option | null
  }

  /**
   * Get the default category based on the listing's category.
   * If the listing category is not found, it defaults to 'fashion'.
   * Returns an object with value and label for the select input.
   */
  const getDefaultCategory = (listingCategory: string) => {
    if (!listingCategory) return null
    const defaultCategory = categories?.find((category) => listingCategory === category.title)
    if (defaultCategory) {
      return {
        value: defaultCategory.title,
        label: t(productCategory[defaultCategory.title as Category]),
      }
    }
    return {
      value: 'fashion',
      label: t(productCategory['fashion']),
    }
  }

  const form = useForm({
    defaultValues: {
      title: listing.title,
      description: listing.description,
      price: String(listing.price),
      category: getDefaultCategory(listing.category),
      images: listing.images,
    },
    validators: { onChange: updateSchema },
    onSubmitMeta: { publish: false },
    onSubmit: async ({ value }) => {
      await updateProduct(value, true)
    },
  })

  const insets = useSafeAreaInsets()
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
  }

  /**
   * Function to update the product listing.
   * It updates the product in the database and invalidates the queries to refresh the data.
   * If `publish` is false, it saves the listing as a draft.
   */
  const updateProduct = async (value: UpdateProduct, publish = false) => {
    if (!publish) setIsSubmittingDraft(true)

    const { category, price, ...rest } = value

    const { error } = await supabase
      .from('products')
      .update({
        ...rest,
        category: category?.value ?? 'fashion',
        price: parseInt(value.price),
        published: publish,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listing.id)
      .select()

    if (!publish) setIsSubmittingDraft(false)

    if (error) {
      console.error(error)
      Toast.show({
        type: 'error',
        text1: t`Oops! Something went wrong.`,
      })
      return
    }

    Toast.show({
      type: 'success',
      text1: publish ? t`Successfully published listing` : t`Successfully saved listing`,
    })
    queryClient.invalidateQueries({ queryKey: ['listings', 'draft'], exact: false })
    queryClient.invalidateQueries({ queryKey: ['listings', 'published', 'own'], exact: false })
    queryClient.invalidateQueries({ queryKey: ['listing', listing.id] })
    router.dismiss()
  }

  /**
   * Opens the image picker to select an image from the camera or library.
   * It uploads the selected image to Supabase storage and updates the form state.
   * @param mode - The mode of image selection, either 'camera' or 'library'.
   * @throws If there is an error during image selection or upload.
   */
  async function pickImage({ mode }: { mode: 'camera' | 'library' }) {
    const imagePickerOptions: ImagePicker.ImagePickerOptions = {
      allowsEditing: true,
      quality: 1,
      exif: false,
    }

    try {
      const result =
        mode === 'camera'
          ? await ImagePicker.launchCameraAsync(imagePickerOptions)
          : await ImagePicker.launchImageLibraryAsync(imagePickerOptions)

      if (result.canceled) return

      const asset = result.assets[0]

      const arraybuffer = await fetch(asset.uri).then((res) => res.arrayBuffer())

      const fileExt = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpeg'
      const path = `${Date.now()}.${fileExt}`
      const { data, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, arraybuffer, {
          contentType: asset.mimeType ?? 'image/jpeg',
        })

      if (uploadError) {
        throw uploadError
      }

      form.setFieldValue('images', [...form.getFieldValue('images'), data.path])
      form.setFieldMeta('images', (prev) => ({ ...prev, isTouched: true }))
      closeBottomSheet()
    } catch (error) {
      console.error('Error uploading image:', error)
      Alert.alert(t`Oops! Something went wrong.`)
    }
  }

  /**
   * Closes the bottom sheet.
   */
  function closeBottomSheet() {
    bottomSheetRef.current?.close()
  }

  /**
   * Opens the bottom sheet to select an image from the camera or library.
   */
  function handleImagePress() {
    bottomSheetRef.current?.expand()
  }

  /**
   * Handles the deletion of an image from the form state.
   * It filters out the image to be deleted and updates the form state accordingly.
   * @param path - The path of the image to be deleted.
   */
  function handleDeleteImagePress(path: string) {
    form.setFieldValue(
      'images',
      form.getFieldValue('images').filter((item) => item !== path)
    )
    form.setFieldMeta('images', (prev) => ({ ...prev, isTouched: true }))
  }

  return (
    <>
      {categories && !isCategoriesFetching ? (
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          <ScrollView automaticallyAdjustKeyboardInsets>
            <View className="pb-safe-offset-2 flex-1 gap-6 p-6">
              <View className="gap-2">
                <Label>
                  <Trans>Images</Trans>
                </Label>
                <form.Field
                  name="images"
                  children={(field) => (
                    <>
                      <Carousel
                        ref={carouselRef}
                        width={width - 48}
                        height={(width - 48) * 0.6}
                        data={
                          field.state.value.length > 4
                            ? field.state.value
                            : [...field.state.value, 'addImage']
                        }
                        onProgressChange={progress}
                        loop={false}
                        renderItem={({ index, item }) => (
                          <View className="flex-1 overflow-hidden rounded-md border border-background">
                            {item === 'addImage' ? (
                              <Button
                                variant="secondary"
                                onPress={handleImagePress}
                                className="flex-1 justify-center gap-2"
                              >
                                <ImagePlus className="self-center color-foreground" />
                                <Text className="text-center">
                                  <Trans>Press here to add an image</Trans>
                                </Text>
                              </Button>
                            ) : (
                              <>
                                <RemoteImage
                                  bucketId="product-images"
                                  path={item}
                                  accessibilityLabel={t`Image ${index + 1} for listing`}
                                  className="h-full w-full"
                                  resizeMode="contain"
                                />
                                <Button
                                  size="icon"
                                  onPress={() => handleDeleteImagePress(item)}
                                  className="absolute right-3 top-3 rounded-full bg-muted"
                                >
                                  <Trash className="size-6 color-foreground" />
                                </Button>
                              </>
                            )}
                          </View>
                        )}
                      />
                      {field.state.value.length > 0 && (
                        <PaginationBasic
                          progress={progress}
                          data={
                            field.state.value.length > 4
                              ? field.state.value
                              : [...field.state.value, 'addImage']
                          }
                          containerClassName="gap-2 mt-3"
                          activeDotClassName="bg-primary rounded-full overflow-hidden"
                          dotClassName="bg-muted-foreground rounded-full"
                          onPress={onPressPagination}
                        />
                      )}
                    </>
                  )}
                />
              </View>
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
                        <SelectContent insets={contentInsets} align="end">
                          <RNGHScrollView className="max-h-40">
                            <SelectGroup>
                              {categories.map((category) => (
                                <SelectItem
                                  key={category.title}
                                  label={t(productCategory[category.title as Category])}
                                  value={category.title}
                                  className="min-w-48"
                                >
                                  {t(productCategory[category.title as Category])}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </RNGHScrollView>
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
              <form.Subscribe
                children={({ isDirty, isSubmitting }) => (
                  <Button
                    disabled={isSubmitting || (!isDirty && listing.published)}
                    onPress={() => {
                      form.handleSubmit()
                    }}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator />
                    ) : (
                      <Text>
                        <Trans>Save and publish</Trans>
                      </Text>
                    )}
                  </Button>
                )}
              />
              <form.Subscribe
                children={({ isDirty, values }) => (
                  <Button
                    variant="secondary"
                    disabled={isSubmittingDraft || !isDirty}
                    onPress={() => updateProduct(values)}
                  >
                    {isSubmittingDraft ? (
                      <ActivityIndicator />
                    ) : (
                      <Text>
                        <Trans>Save as draft</Trans>
                      </Text>
                    )}
                  </Button>
                )}
              />
            </View>
          </ScrollView>
          <BottomSheet
            ref={bottomSheetRef}
            enablePanDownToClose
            index={-1}
            backgroundStyle={{ backgroundColor: isDarkColorScheme ? 'black' : 'white' }}
            handleIndicatorStyle={{
              backgroundColor: isDarkColorScheme ? 'white' : 'black',
            }}
            backdropComponent={(props) => (
              <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
            )}
          >
            <BottomSheetScrollView scrollEnabled={false} className="flex-1">
              <View className="pb-safe flex-1 gap-4 p-4">
                <Button
                  variant="secondary"
                  className="flex-1 flex-row justify-between"
                  onPress={() => pickImage({ mode: 'camera' })}
                >
                  <Text>
                    <Trans>Upload from Camera</Trans>
                  </Text>
                  <Camera className="color-primary" />
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 flex-row justify-between"
                  onPress={() => pickImage({ mode: 'library' })}
                >
                  <Text>
                    <Trans>Upload from Library</Trans>
                  </Text>
                  <Images className="color-primary" />
                </Button>
                <Button variant="ghost" onPress={closeBottomSheet}>
                  <Text>
                    <Trans>Cancel</Trans>
                  </Text>
                </Button>
              </View>
            </BottomSheetScrollView>
          </BottomSheet>
        </KeyboardAvoidingView>
      ) : (
        <View className="flex-1 justify-center gap-4">
          {isCategoriesFetching ? (
            <ActivityIndicator />
          ) : (
            <>
              <Frown className="mx-auto size-12 color-muted-foreground" />
              <Muted className="mx-auto">
                <Trans>Oops! Something went wrong.</Trans>
              </Muted>
            </>
          )}
        </View>
      )}
    </>
  )
}
