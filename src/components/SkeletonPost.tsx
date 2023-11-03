import { Component, mergeProps, splitProps } from 'solid-js';
import {
    Skeleton
} from "@kobalte/core";

export interface SkeletonProps {
  class?: string;
}

export const DEFAULT_CLASS="skeleton w-full pl-5"

export const SkeletonPost: Component<SkeletonProps> = (props) => {
  props = mergeProps(
    {
      class: DEFAULT_CLASS,
    }, props);

  const [local, rest] = splitProps(props, [
    'class'
  ]);

  return (
    <div>
      <Skeleton.Root class="skeleton w-full p-2 mt-3"  height={20} radius={10} />
      <Skeleton.Root class="skeleton w-full p-4  mt-3"  height={20} radius={10}  />
      <div class='flex flex-row  mt-3'>
        <Skeleton.Root class="skeleton pl-5 ml-5"  height={20} width={20} radius={10} />
        <Skeleton.Root class="skeleton pl-5 ml-5"  height={20} width={20} radius={10} />
        <Skeleton.Root class="skeleton pl-5 ml-5"  height={20} width={20} radius={10}  />
      </div>

    </div>
  );
};