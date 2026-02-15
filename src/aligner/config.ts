import * as vscode from 'vscode';
import { Config_Aligner } from './types';
import { config_Validate } from './aligner';

// Значения по умолчанию
const DEFAULT_CONFIG: Config_Aligner = {
  separators: ['=>', '::', '=', ':', '->', ','] as any,
  padding: 2 as any,
  alignComments: true,
  ignorePrefix: ['//', '#', ';'],
  languages: []
};

/**
 * Загрузка конфигурации для документа
 */
export async function config_Resolve_For_Document(document: vscode.TextDocument): Promise<Config_Aligner> {
  // 1. Попробуем найти .ladnikrc.json в корне рабочей области
  const workspace_Folder = vscode.workspace.getWorkspaceFolder(document.uri);
  if (workspace_Folder) {
    const config_Path = vscode.Uri.joinPath(workspace_Folder.uri, '.ladnikrc.json');
    
    try {
      // Попробуем прочитать файл конфигурации
      const config_Content_Buffer = await vscode.workspace.fs.readFile(config_Path);
      const config_Content = config_Content_Buffer.toString();
      const config_Obj = JSON.parse(config_Content.toString());
      
      // Проверим общую конфигурацию
      if (config_Obj.align) {
        let resolved_Config = { ...DEFAULT_CONFIG, ...config_Obj.align };
        
        // Применим специфичные правила для языка, если они есть
        if (config_Obj.rules && config_Obj.rules[document.fileName.slice(document.fileName.lastIndexOf('.'))]) {
          const lang_Specific_Config = config_Obj.rules[document.fileName.slice(document.fileName.lastIndexOf('.'))];
          resolved_Config = { ...resolved_Config, ...lang_Specific_Config };
        }
        
        const validation_Result = config_Validate(resolved_Config);
        if (validation_Result.success) {
          return validation_Result.value;
        } else {
          console.error(`Invalid configuration in .ladnikrc.json: ${validation_Result.error}`);
          vscode.window.showWarningMessage(`Invalid configuration in .ladnikrc.json: ${validation_Result.error}. Using defaults.`);
        }
      }
    } catch (error) {
      // Файл конфигурации не существует или не может быть прочитан
      console.log('.ladnikrc.json not found or invalid:', error);
    }
  }
  
  // 2. Попробуем получить настройки из settings.json
  const extension_Config = vscode.workspace.getConfiguration('ladnik');
  const user_Separators = extension_Config.get<string[]>('defaultSeparators');
  const user_Padding = extension_Config.get<number>('defaultPadding');
  
  if (user_Separators || user_Padding !== undefined) {
    const user_Config: Partial<Config_Aligner> = {};
    
    if (user_Separators) {
      user_Config.separators = user_Separators as any;
    }
    
    if (user_Padding !== undefined) {
      user_Config.padding = user_Padding as any;
    }
    
    const combined_Config = { ...DEFAULT_CONFIG, ...user_Config };
    const validation_Result = config_Validate(combined_Config);
    
    if (validation_Result.success) {
      return validation_Result.value;
    } else {
      console.error(`Invalid user configuration: ${validation_Result.error}`);
      vscode.window.showWarningMessage(`Invalid user configuration: ${validation_Result.error}. Using defaults.`);
    }
  }
  
  // 3. Возвращаем значения по умолчанию
  return DEFAULT_CONFIG;
}