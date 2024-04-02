/**
 * Copyright (C) 2023 Zuoqiu Yingyi
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// REF: https://github.com/Zuoqiu-Yingyi/siyuan/blob/b41e2e6c443fe052b629764a20af962877856227/app/src/types/index.d.ts#L9-L39
export type TOperation = "create"
    | "update"
    | "insert"
    | "delete"
    | "move"
    | "append"
    | "appendInsert"
    | "prependInsert"
    | "foldHeading"
    | "unfoldHeading"
    | "setAttrs"
    | "doUpdateUpdated"
    | "addFlashcards"
    | "removeFlashcards"
    | "setAttrViewName"
    | "setAttrViewFilters"
    | "setAttrViewSorts"
    | "setAttrViewPageSize"
    | "setAttrViewColWidth"
    | "setAttrViewColWrap"
    | "setAttrViewColHidden"
    | "setAttrViewColPin"
    | "setAttrViewColIcon"
    | "insertAttrViewBlock"
    | "removeAttrViewBlock"
    | "addAttrViewCol"
    | "updateAttrViewCol"
    | "removeAttrViewCol"
    | "sortAttrViewRow"
    | "sortAttrViewCol"
    | "updateAttrViewCell"
    | "updateAttrViewColOptions"
    | "removeAttrViewColOption"
    | "updateAttrViewColOption"
    | "setAttrViewColCalc"
    | "updateAttrViewColNumberFormat"
    | "replaceAttrViewBlock"
    | "updateAttrViewColTemplate"
    | "addAttrViewView"
    | "removeAttrViewView"
    | "setAttrViewViewName"
    | "setAttrViewViewIcon"
    | "duplicateAttrViewView"
    | "sortAttrViewView"
    | "updateAttrViewColRelation"
    | "updateAttrViewColRollup"
    | "hideAttrViewName"

// REF: https://github.com/Zuoqiu-Yingyi/siyuan/blob/b41e2e6c443fe052b629764a20af962877856227/app/src/types/index.d.ts#L330-L347
export interface IOperation {
    action: TOperation, // move， delete 不需要传 data
    id?: string,
    avID?: string,  // av
    format?: string // updateAttrViewColNumberFormat 专享
    keyID?: string // updateAttrViewCell 专享
    rowID?: string // updateAttrViewCell 专享
    data?: any, // updateAttr 时为  { old: IObject, new: IObject }, updateAttrViewCell 时为 {TAVCol: {content: string}}
    parentID?: string
    previousID?: string
    retData?: any
    nextID?: string // insert 专享
    srcIDs?: string[] // insertAttrViewBlock 专享
    name?: string // addAttrViewCol 专享
    type?: TAVCol // addAttrViewCol 专享
    deckID?: string // add/removeFlashcards 专享
    blockIDs?: string[] // add/removeFlashcards 专享
}

export interface ITransaction {
    doOperations: IOperation[];
    undoOperations: IOperation[];
}
